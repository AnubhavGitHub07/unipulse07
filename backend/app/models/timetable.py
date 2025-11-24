from typing import Optional, List
from datetime import datetime, time
from bson import ObjectId
from pydantic import BaseModel, Field


# PyObjectId is now just str - we convert ObjectId to str when needed


class TimeSlot(BaseModel):
    start_time: str  # "HH:MM" format
    end_time: str    # "HH:MM" format
    subject: str
    faculty: Optional[str] = None
    room: Optional[str] = None


class TimetableEntry(BaseModel):
    student_id: Optional[str] = None  # None for common timetable
    day: str  # "Monday", "Tuesday", etc.
    time_slots: List[TimeSlot]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class TimetableResponse(TimetableEntry):
    id: Optional[str] = Field(default=None, alias="_id")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

