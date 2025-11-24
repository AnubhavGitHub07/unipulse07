from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from app.models.timetable import TimetableEntry, TimetableResponse
from app.models.user import User
from app.auth.jwt import get_current_user, get_current_admin_user
from app.database import get_database
from datetime import datetime

router = APIRouter(prefix="/api/timetable", tags=["Timetable"])


@router.post("/", response_model=TimetableResponse, status_code=201)
async def create_timetable(
    timetable: TimetableEntry,
    current_user: User = Depends(get_current_admin_user)
):
    """Create or update timetable (admin only)"""
    db = get_database()
    
    # Build query
    query = {"day": timetable.day}
    if timetable.student_id:
        query["student_id"] = timetable.student_id
    else:
        query["student_id"] = None  # Common timetable
    
    # Check if exists
    existing = await db.timetable.find_one(query)
    
    # Prepare document
    timetable_doc = {
        "student_id": timetable.student_id,
        "day": timetable.day,
        "time_slots": [slot.dict() for slot in timetable.time_slots],
        "updated_at": datetime.utcnow()
    }
    
    if existing:
        # Update
        timetable_doc["created_at"] = existing.get("created_at", datetime.utcnow())
        await db.timetable.update_one(query, {"$set": timetable_doc})
        timetable_doc["_id"] = existing["_id"]
    else:
        # Create
        timetable_doc["created_at"] = datetime.utcnow()
        result = await db.timetable.insert_one(timetable_doc)
        timetable_doc["_id"] = result.inserted_id
    
    return TimetableResponse(**timetable_doc, id=timetable_doc["_id"])


@router.get("/", response_model=List[TimetableResponse])
async def get_timetable(
    student_id: Optional[str] = Query(None),
    day: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    """Get timetable"""
    db = get_database()
    
    # Build query
    query = {}
    
    # Students see their own timetable or common timetable
    if current_user.role == "student":
        query["$or"] = [
            {"student_id": current_user.student_id},
            {"student_id": None}  # Common timetable
        ]
    elif student_id:
        query["$or"] = [
            {"student_id": student_id},
            {"student_id": None}
        ]
    else:
        query["student_id"] = None  # Only common timetable for admins if no student_id
    
    if day:
        query["day"] = day
    
    # Fetch records
    cursor = db.timetable.find(query).sort("day", 1)
    timetables = await cursor.to_list(length=None)
    
    return [TimetableResponse(**t, id=t["_id"]) for t in timetables]


@router.get("/current-week")
async def get_current_week_timetable(
    current_user: User = Depends(get_current_user)
):
    """Get complete weekly timetable"""
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    db = get_database()
    
    # Build query
    if current_user.role == "student":
        query = {
            "$or": [
                {"student_id": current_user.student_id},
                {"student_id": None}
            ]
        }
    else:
        query = {"student_id": None}
    
    # Fetch all timetables
    cursor = db.timetable.find(query)
    all_timetables = await cursor.to_list(length=None)
    
    # Organize by day
    weekly_timetable = {}
    for day in days:
        weekly_timetable[day] = []
    
    for timetable in all_timetables:
        day = timetable["day"]
        if day in weekly_timetable:
            # Prioritize student-specific over common
            if timetable.get("student_id") and day not in [t["day"] for t in weekly_timetable[day] if t.get("student_id")]:
                weekly_timetable[day].append(TimetableResponse(**timetable, id=timetable["_id"]))
            elif not timetable.get("student_id"):
                # Add common timetable if no student-specific exists
                if not any(t.get("student_id") for t in weekly_timetable[day]):
                    weekly_timetable[day].append(TimetableResponse(**timetable, id=timetable["_id"]))
    
    # Convert to list format
    result = []
    for day in days:
        for timetable in weekly_timetable[day]:
            result.append({
                "day": day,
                "time_slots": timetable.time_slots
            })
            break  # Only one timetable per day
    
    return {"timetable": result}

