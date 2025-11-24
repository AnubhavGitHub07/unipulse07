from typing import Optional, List
from datetime import datetime, date
from bson import ObjectId
from pydantic import BaseModel, Field


# PyObjectId is now just str - we convert ObjectId to str when needed


class AttendanceRecord(BaseModel):
    student_id: str
    subject: str
    date: date
    status: str  # "present", "absent"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AttendanceCreate(BaseModel):
    student_id: str
    subject: str
    date: date
    status: str


class AttendanceResponse(AttendanceRecord):
    id: Optional[str] = Field(default=None, alias="_id")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, date: str}


class AttendanceBulkUpload(BaseModel):
    records: List[AttendanceCreate]


class AttendanceStats(BaseModel):
    student_id: str
    subject: Optional[str] = None
    total_classes: int
    present: int
    absent: int
    percentage: float

