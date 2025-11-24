from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel, Field


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)


class SubjectGrade(BaseModel):
    subject: str
    grade: str
    marks: Optional[float] = None
    credits: Optional[float] = None


class Result(BaseModel):
    student_id: str
    semester: int
    academic_year: str  # "2023-24"
    subjects: List[SubjectGrade]
    sgpa: Optional[float] = None
    cgpa: Optional[float] = None
    file_url: Optional[str] = None  # PDF of result
    uploaded_by: str  # admin student_id
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    published_at: Optional[datetime] = None


class ResultCreate(BaseModel):
    student_id: str
    semester: int
    academic_year: str
    subjects: List[SubjectGrade]
    sgpa: Optional[float] = None
    cgpa: Optional[float] = None


class ResultResponse(Result):
    id: Optional[str] = Field(default=None, alias="_id")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

