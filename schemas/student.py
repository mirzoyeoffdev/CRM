from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date, datetime
import re


class StudentBase(BaseModel):
    first_name: str
    last_name: str
    phone: str
    email: Optional[str] = None
    birth_date: Optional[date] = None
    address: Optional[str] = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        cleaned = re.sub(r"[\s\-\(\)]", "", v)
        if not re.match(r"^\+?[0-9]{9,15}$", cleaned):
            raise ValueError("Noto'g'ri telefon raqami formati")
        return cleaned


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    birth_date: Optional[date] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None


class StudentResponse(StudentBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
