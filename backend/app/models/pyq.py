from typing import Optional
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel, Field


# PyObjectId is now just str - we convert ObjectId to str when needed


class PYQDocument(BaseModel):
    subject: str
    semester: int
    year: int
    exam_type: str  # "midterm", "final", "quiz"
    file_url: str
    file_name: str
    uploaded_by: str  # admin student_id
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)


class PYQCreate(BaseModel):
    subject: str
    semester: int
    year: int
    exam_type: str


class PYQResponse(PYQDocument):
    id: Optional[str] = Field(default=None, alias="_id")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class PYQFilter(BaseModel):
    subject: Optional[str] = None
    semester: Optional[int] = None
    year: Optional[int] = None
    exam_type: Optional[str] = None

