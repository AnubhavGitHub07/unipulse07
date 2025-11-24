import pandas as pd
from typing import List
from datetime import datetime
from fastapi import HTTPException
from app.models.attendance import AttendanceCreate


def parse_attendance_csv(file_content: bytes) -> List[AttendanceCreate]:
    """Parse CSV file containing attendance records"""
    try:
        # Read CSV
        df = pd.read_csv(pd.io.common.BytesIO(file_content))
        
        # Expected columns: student_id, subject, date, status
        required_columns = ["student_id", "subject", "date", "status"]
        
        # Check if all required columns exist
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {', '.join(missing_columns)}"
            )
        
        # Parse records
        records = []
        for _, row in df.iterrows():
            try:
                # Parse date
                date_str = str(row["date"]).strip()
                date_obj = pd.to_datetime(date_str).date()
                
                # Validate status
                status = str(row["status"]).strip().lower()
                if status not in ["present", "absent", "p", "a"]:
                    status = "absent"  # Default to absent if invalid
                else:
                    status = "present" if status in ["present", "p"] else "absent"
                
                record = AttendanceCreate(
                    student_id=str(row["student_id"]).strip(),
                    subject=str(row["subject"]).strip(),
                    date=date_obj,
                    status=status
                )
                records.append(record)
            except Exception as e:
                # Skip invalid rows
                continue
        
        if not records:
            raise HTTPException(
                status_code=400,
                detail="No valid attendance records found in CSV"
            )
        
        return records
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="CSV file is empty")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing CSV: {str(e)}")

