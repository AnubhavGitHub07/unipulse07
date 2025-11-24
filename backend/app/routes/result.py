from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
from typing import Optional, List
from app.models.result import ResultCreate, ResultResponse
from app.models.user import User
from app.auth.jwt import get_current_user, get_current_admin_user
from app.database import get_database
from app.utils.file_upload import upload_file
from datetime import datetime

router = APIRouter(prefix="/api/results", tags=["Results"])


@router.post("/", response_model=ResultResponse, status_code=201)
async def create_result(
    file: Optional[UploadFile] = File(None),
    student_id: str = Query(...),
    semester: int = Query(...),
    academic_year: str = Query(...),
    subjects: Optional[str] = Query(None),  # JSON string
    sgpa: Optional[float] = Query(None),
    cgpa: Optional[float] = Query(None),
    current_user: User = Depends(get_current_admin_user)
):
    """Create/upload a result (admin only)"""
    import json
    from app.models.result import SubjectGrade
    
    db = get_database()
    
    # Upload file if provided
    file_url = None
    if file:
        file_url, _ = await upload_file(file, subdirectory="results")
    
    # Parse subjects if provided
    subjects_list = []
    if subjects:
        try:
            subjects_data = json.loads(subjects)
            subjects_list = [SubjectGrade(**subj) for subj in subjects_data]
        except:
            pass
    
    # Create result document
    result_doc = {
        "student_id": student_id,
        "semester": semester,
        "academic_year": academic_year,
        "subjects": [subj.dict() for subj in subjects_list] if subjects_list else [],
        "sgpa": sgpa,
        "cgpa": cgpa,
        "file_url": file_url,
        "uploaded_by": current_user.student_id,
        "uploaded_at": datetime.utcnow(),
        "published_at": datetime.utcnow()  # Auto-publish
    }
    
    # Check if result already exists
    existing = await db.results.find_one({
        "student_id": student_id,
        "semester": semester,
        "academic_year": academic_year
    })
    
    if existing:
        # Update existing
        await db.results.update_one(
            {"_id": existing["_id"]},
            {"$set": result_doc}
        )
        result_doc["_id"] = existing["_id"]
    else:
        # Create new
        result_obj = await db.results.insert_one(result_doc)
        result_doc["_id"] = result_obj.inserted_id
    
    return ResultResponse(**result_doc, id=result_doc["_id"])


@router.get("/", response_model=List[ResultResponse])
async def get_results(
    student_id: Optional[str] = Query(None),
    semester: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user)
):
    """Get results (students can only see their own)"""
    db = get_database()
    
    # Build query
    if current_user.role == "student":
        query = {"student_id": current_user.student_id}
    elif student_id:
        query = {"student_id": student_id}
    else:
        raise HTTPException(status_code=400, detail="student_id required for admin")
    
    if semester:
        query["semester"] = semester
    
    # Fetch results
    cursor = db.results.find(query).sort([("academic_year", -1), ("semester", -1)])
    results = await cursor.to_list(length=None)
    
    return [ResultResponse(**r, id=r["_id"]) for r in results]


@router.get("/{result_id}", response_model=ResultResponse)
async def get_result(
    result_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific result"""
    from bson import ObjectId
    
    db = get_database()
    
    result = await db.results.find_one({"_id": ObjectId(result_id)})
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    
    # Check access
    if current_user.role == "student" and result["student_id"] != current_user.student_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return ResultResponse(**result, id=result["_id"])


@router.get("/cgpa/calculate")
async def calculate_cgpa(
    student_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    """Calculate overall CGPA for a student"""
    db = get_database()
    
    # Determine student_id
    target_student_id = student_id if current_user.role == "admin" else current_user.student_id
    
    if current_user.role == "student" and student_id and student_id != current_user.student_id:
        raise HTTPException(status_code=403, detail="Cannot view other students' CGPA")
    
    # Fetch all results
    cursor = db.results.find({"student_id": target_student_id})
    results = await cursor.to_list(length=None)
    
    if not results:
        return {
            "student_id": target_student_id,
            "cgpa": None,
            "total_semesters": 0,
            "semesters": []
        }
    
    # Calculate weighted CGPA
    total_sgpa = 0
    total_semesters = 0
    semester_details = []
    
    for result in sorted(results, key=lambda x: (x["academic_year"], x["semester"])):
        if result.get("sgpa"):
            total_sgpa += result["sgpa"]
            total_semesters += 1
            semester_details.append({
                "semester": result["semester"],
                "academic_year": result["academic_year"],
                "sgpa": result["sgpa"]
            })
    
    cgpa = (total_sgpa / total_semesters) if total_semesters > 0 else None
    
    return {
        "student_id": target_student_id,
        "cgpa": round(cgpa, 2) if cgpa else None,
        "total_semesters": total_semesters,
        "semesters": semester_details
    }

