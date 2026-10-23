from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from models.attendance import AttendanceStatus


class AttendanceCreate(BaseModel):
    student_id: int
    group_id: int
    date: date
    status: AttendanceStatus = AttendanceStatus.present
    note: Optional[str] = None


class AttendanceUpdate(BaseModel):
    status: Optional[AttendanceStatus] = None
    note: Optional[str] = None


class AttendanceResponse(BaseModel):
    id: int
    student_id: int
    group_id: int
    date: date
    status: AttendanceStatus
    note: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class AttendanceSummary(BaseModel):
    student_id: int
    student_name: str
    total_lessons: int
    present: int
    absent: int
    late: int
    excused: int
    attendance_rate: float  # foizda
