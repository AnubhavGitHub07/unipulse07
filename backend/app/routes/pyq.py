from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
from typing import Optional, List
from app.models.pyq import PYQCreate, PYQResponse, PYQFilter
from app.models.user import User
from app.auth.jwt import get_current_user, get_current_admin_user
from app.database import get_database
from app.utils.file_upload import upload_file
from datetime import datetime

router = APIRouter(prefix="/api/pyq", tags=["PYQ (Previous Year Questions)"])


@router.post("/upload", response_model=PYQResponse, status_code=201)
async def upload_pyq(
    file: UploadFile = File(...),
    subject: str = Query(...),
    semester: int = Query(...),
    year: int = Query(...),
    exam_type: str = Query(...),
    current_user: User = Depends(get_current_admin_user)
):
    """Upload PYQ document (admin only)"""
    # Validate file type
    if not file.filename.endswith((".pdf", ".doc", ".docx")):
        raise HTTPException(status_code=400, detail="File must be PDF, DOC, or DOCX")
    
    # Upload file
    file_url, file_name = await upload_file(file, subdirectory="pyq")
    
    # Create PYQ document
    db = get_database()
    pyq_doc = {
        "subject": subject,
        "semester": semester,
        "year": year,
        "exam_type": exam_type.lower(),
        "file_url": file_url,
        "file_name": file_name,
        "uploaded_by": current_user.student_id,
        "uploaded_at": datetime.utcnow()
    }
    
    result = await db.pyq.insert_one(pyq_doc)
    pyq_doc["_id"] = result.inserted_id
    
    return PYQResponse(**pyq_doc, id=pyq_doc["_id"])


@router.get("/", response_model=List[PYQResponse])
async def get_pyqs(
    subject: Optional[str] = Query(None),
    semester: Optional[int] = Query(None),
    year: Optional[int] = Query(None),
    exam_type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    """Get PYQ documents with optional filters"""
    db = get_database()
    
    # Build query
    query = {}
    if subject:
        query["subject"] = subject
    if semester:
        query["semester"] = semester
    if year:
        query["year"] = year
    if exam_type:
        query["exam_type"] = exam_type.lower()
    
    # Fetch PYQs
    cursor = db.pyq.find(query).sort([("year", -1), ("semester", -1)])
    pyqs = await cursor.to_list(length=None)
    
    return [PYQResponse(**p, id=p["_id"]) for p in pyqs]


@router.get("/subjects")
async def get_pyq_subjects(current_user: User = Depends(get_current_user)):
    """Get list of all subjects with PYQs"""
    db = get_database()
    
    # Get distinct subjects
    subjects = await db.pyq.distinct("subject")
    
    return {"subjects": sorted(subjects)}


@router.delete("/{pyq_id}", status_code=204)
async def delete_pyq(
    pyq_id: str,
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a PYQ document (admin only)"""
    from bson import ObjectId
    from app.utils.file_upload import delete_file
    
    db = get_database()
    
    # Find and delete
    pyq = await db.pyq.find_one({"_id": ObjectId(pyq_id)})
    if not pyq:
        raise HTTPException(status_code=404, detail="PYQ not found")
    
    # Delete file
    await delete_file(pyq["file_url"])
    
    # Delete document
    await db.pyq.delete_one({"_id": ObjectId(pyq_id)})
    
    return None

