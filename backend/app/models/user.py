from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel, Field, EmailStr


class UserBase(BaseModel):
    student_id: str
    name: str
    email: Optional[EmailStr] = None
    role: str = "student"  # student or admin


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    student_id: str
    password: str


class User(UserBase):
    id: Optional[str] = Field(default=None, alias="_id")
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        
    def __init__(self, **data):
        # Convert ObjectId to string if needed
        if '_id' in data and isinstance(data['_id'], ObjectId):
            data['_id'] = str(data['_id'])
        if 'id' in data and isinstance(data['id'], ObjectId):
            data['id'] = str(data['id'])
        super().__init__(**data)


class UserResponse(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
