from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class EnrollmentCreate(BaseModel):
    student_id: int
    group_id: int
    start_date: date
    note: Optional[str] = None


class EnrollmentUpdate(BaseModel):
    end_date: Optional[date] = None
    is_active: Optional[bool] = None
    note: Optional[str] = None


class EnrollmentResponse(BaseModel):
    id: int
    student_id: int
    group_id: int
    start_date: date
    end_date: Optional[date]
    is_active: bool
    note: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
