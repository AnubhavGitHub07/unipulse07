import os
import uuid
from typing import Optional
from fastapi import UploadFile, HTTPException
from app.config import settings
import boto3
from botocore.exceptions import ClientError

# Initialize S3 client if credentials are provided
s3_client = None
if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
    s3_client = boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.S3_REGION
    )


async def upload_file_to_local(file: UploadFile, subdirectory: str = "") -> tuple[str, str]:
    """Upload file to local storage"""
    # Ensure upload directory exists
    upload_path = os.path.join(settings.UPLOAD_DIR, subdirectory)
    os.makedirs(upload_path, exist_ok=True)
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(upload_path, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        if len(content) > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File size exceeds {settings.MAX_UPLOAD_SIZE / 1024 / 1024}MB limit"
            )
        buffer.write(content)
    
    # Return relative path and filename
    relative_path = os.path.join(subdirectory, unique_filename) if subdirectory else unique_filename
    return relative_path, file.filename


async def upload_file_to_s3(file: UploadFile, subdirectory: str = "") -> tuple[str, str]:
    """Upload file to AWS S3"""
    if not s3_client or not settings.S3_BUCKET_NAME:
        raise HTTPException(
            status_code=500,
            detail="S3 configuration not available. Using local storage."
        )
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    s3_key = f"{subdirectory}/{unique_filename}" if subdirectory else unique_filename
    
    # Read file content
    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File size exceeds {settings.MAX_UPLOAD_SIZE / 1024 / 1024}MB limit"
        )
    
    # Upload to S3
    try:
        s3_client.put_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=s3_key,
            Body=content,
            ContentType=file.content_type or "application/octet-stream"
        )
        
        # Generate public URL
        file_url = f"https://{settings.S3_BUCKET_NAME}.s3.{settings.S3_REGION}.amazonaws.com/{s3_key}"
        return file_url, file.filename
    except ClientError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error uploading file to S3: {str(e)}"
        )


async def upload_file(file: UploadFile, subdirectory: str = "") -> tuple[str, str]:
    """Upload file - uses S3 if configured, otherwise local storage"""
    if s3_client and settings.S3_BUCKET_NAME:
        return await upload_file_to_s3(file, subdirectory)
    else:
        file_path, original_name = await upload_file_to_local(file, subdirectory)
        # Return local URL path
        file_url = f"/files/{file_path}"
        return file_url, original_name


async def delete_file(file_url: str):
    """Delete a file from storage"""
    if file_url.startswith("http"):
        # S3 file
        if s3_client and settings.S3_BUCKET_NAME:
            try:
                # Extract key from URL
                key = file_url.split(f"{settings.S3_BUCKET_NAME}.s3")[1].split("/", 1)[1]
                s3_client.delete_object(Bucket=settings.S3_BUCKET_NAME, Key=key)
            except Exception:
                pass
    else:
        # Local file
        if file_url.startswith("/files/"):
            file_path = file_url.replace("/files/", "")
            full_path = os.path.join(settings.UPLOAD_DIR, file_path)
            if os.path.exists(full_path):
                os.remove(full_path)

