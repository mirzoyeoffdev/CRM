from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date, datetime
from models.grade import ExamType


class GradeCreate(BaseModel):
    student_id: int
    group_id: int
    exam_type: ExamType
    score: float
    max_score: float = 100.0
    exam_date: date
    note: Optional[str] = None

    @field_validator("score")
    @classmethod
    def validate_score(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Ball manfiy bo'lishi mumkin emas")
        return v


class GradeResponse(BaseModel):
    id: int
    student_id: int
    group_id: int
    exam_type: ExamType
    score: float
    max_score: float
    exam_date: date
    note: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class GradeSummary(BaseModel):
    student_id: int
    student_name: str
    group_id: int
    average_score: float      # O'rtacha ball (foizda)
    total_exams: int
