from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
from typing import Optional, List
from datetime import date, datetime
from app.models.attendance import (
    AttendanceCreate,
    AttendanceResponse,
    AttendanceStats
)
from app.models.user import User
from app.auth.jwt import get_current_user, get_current_admin_user
from app.database import get_database
from app.utils.csv_parser import parse_attendance_csv
from bson import ObjectId

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])


@router.post("/", response_model=AttendanceResponse, status_code=201)
async def create_attendance_record(
    record: AttendanceCreate,
    current_user: User = Depends(get_current_admin_user)
):
    """Create a single attendance record (admin only)"""
    db = get_database()
    
    # Check if record already exists
    existing = await db.attendance.find_one({
        "student_id": record.student_id,
        "subject": record.subject,
        "date": record.date.isoformat()
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Attendance record already exists")
    
    # Create record
    record_doc = {
        "student_id": record.student_id,
        "subject": record.subject,
        "date": record.date.isoformat(),
        "status": record.status,
        "created_at": datetime.utcnow()
    }
    
    result = await db.attendance.insert_one(record_doc)
    record_doc["_id"] = result.inserted_id
    
    return AttendanceResponse(**record_doc, id=record_doc["_id"])


@router.post("/bulk-upload", status_code=201)
async def bulk_upload_attendance(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin_user)
):
    """Upload attendance records via CSV (admin only)"""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    # Read file content
    content = await file.read()
    
    # Parse CSV
    records = parse_attendance_csv(content)
    
    # Insert records
    db = get_database()
    inserted_count = 0
    skipped_count = 0
    
    for record in records:
        # Check if record exists
        existing = await db.attendance.find_one({
            "student_id": record.student_id,
            "subject": record.subject,
            "date": record.date.isoformat()
        })
        
        if not existing:
            record_doc = {
                "student_id": record.student_id,
                "subject": record.subject,
                "date": record.date.isoformat(),
                "status": record.status,
                "created_at": datetime.utcnow()
            }
            await db.attendance.insert_one(record_doc)
            inserted_count += 1
        else:
            skipped_count += 1
    
    return {
        "message": "Attendance records uploaded",
        "inserted": inserted_count,
        "skipped": skipped_count,
        "total": len(records)
    }


@router.get("/", response_model=List[AttendanceResponse])
async def get_attendance_records(
    student_id: Optional[str] = Query(None),
    subject: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    """Get attendance records (students can only see their own)"""
    db = get_database()
    
    # Build query
    query = {}
    
    # Students can only see their own records
    if current_user.role == "student":
        query["student_id"] = current_user.student_id
    elif student_id:
        query["student_id"] = student_id
    
    if subject:
        query["subject"] = subject
    
    if start_date or end_date:
        query["date"] = {}
        if start_date:
            query["date"]["$gte"] = start_date
        if end_date:
            query["date"]["$lte"] = end_date
    
    # Fetch records
    cursor = db.attendance.find(query).sort("date", -1).limit(100)
    records = await cursor.to_list(length=100)
    
    return [AttendanceResponse(**r, id=r["_id"]) for r in records]


@router.get("/stats", response_model=AttendanceStats)
async def get_attendance_stats(
    student_id: Optional[str] = Query(None),
    subject: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    """Get attendance statistics"""
    db = get_database()
    
    # Determine student_id
    target_student_id = student_id if current_user.role == "admin" else current_user.student_id
    
    if current_user.role == "student" and student_id and student_id != current_user.student_id:
        raise HTTPException(status_code=403, detail="Cannot view other students' stats")
    
    # Build query
    query = {"student_id": target_student_id}
    if subject:
        query["subject"] = subject
    
    # Fetch all records
    cursor = db.attendance.find(query)
    records = await cursor.to_list(length=None)
    
    # Calculate stats
    total = len(records)
    present = sum(1 for r in records if r["status"] == "present")
    absent = total - present
    percentage = (present / total * 100) if total > 0 else 0.0
    
    return AttendanceStats(
        student_id=target_student_id,
        subject=subject,
        total_classes=total,
        present=present,
        absent=absent,
        percentage=round(percentage, 2)
    )


@router.get("/stats/subject-wise")
async def get_subject_wise_stats(
    student_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    """Get attendance statistics grouped by subject"""
    db = get_database()
    
    # Determine student_id
    target_student_id = student_id if current_user.role == "admin" else current_user.student_id
    
    if current_user.role == "student" and student_id and student_id != current_user.student_id:
        raise HTTPException(status_code=403, detail="Cannot view other students' stats")
    
    # Fetch all records
    cursor = db.attendance.find({"student_id": target_student_id})
    records = await cursor.to_list(length=None)
    
    # Group by subject
    subject_stats = {}
    for record in records:
        subject = record["subject"]
        if subject not in subject_stats:
            subject_stats[subject] = {"total": 0, "present": 0, "absent": 0}
        
        subject_stats[subject]["total"] += 1
        if record["status"] == "present":
            subject_stats[subject]["present"] += 1
        else:
            subject_stats[subject]["absent"] += 1
    
    # Calculate percentages
    result = []
    for subject, stats in subject_stats.items():
        percentage = (stats["present"] / stats["total"] * 100) if stats["total"] > 0 else 0.0
        result.append({
            "subject": subject,
            "total_classes": stats["total"],
            "present": stats["present"],
            "absent": stats["absent"],
            "percentage": round(percentage, 2)
        })
    
    return {"student_id": target_student_id, "subjects": result}

