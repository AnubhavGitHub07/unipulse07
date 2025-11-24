from fastapi import APIRouter, HTTPException, status, Depends
from datetime import timedelta
from app.models.user import UserCreate, UserLogin, UserResponse
from app.auth.jwt import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user
)
from app.database import get_database
from app.config import settings
from app.models.user import User
from bson import ObjectId

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user (admin only in production)"""
    db = get_database()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"student_id": user_data.student_id})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student ID already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user document
    from datetime import datetime
    now = datetime.utcnow()
    user_doc = {
        "student_id": user_data.student_id,
        "name": user_data.name,
        "email": user_data.email,
        "role": user_data.role,
        "hashed_password": hashed_password,
        "created_at": now,
        "updated_at": now
    }
    
    # Insert user
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    
    # Return user (without password)
    user_response = UserResponse(
        id=str(user_doc["_id"]),
        student_id=user_doc["student_id"],
        name=user_doc["name"],
        email=user_doc["email"],
        role=user_doc["role"],
        created_at=user_doc["created_at"],
        updated_at=user_doc["updated_at"]
    )
    
    return user_response


@router.post("/login")
async def login(credentials: UserLogin):
    """Login and get access token"""
    db = get_database()
    
    # Find user
    user = await db.users.find_one({"student_id": credentials.student_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid student ID or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid student ID or password"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["student_id"], "role": user["role"]},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "student_id": user["student_id"],
            "name": user["name"],
            "email": user.get("email"),
            "role": user["role"]
        }
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user info"""
    return UserResponse(
        id=str(current_user.id),
        student_id=current_user.student_id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )

