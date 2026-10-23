from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date, datetime
from models.payment import PaymentMethod


class PaymentCreate(BaseModel):
    student_id: int
    group_id: int
    amount: int
    payment_date: date
    payment_method: PaymentMethod = PaymentMethod.cash
    period_year: int
    period_month: int
    note: Optional[str] = None

    @field_validator("period_month")
    @classmethod
    def validate_month(cls, v: int) -> int:
        if not 1 <= v <= 12:
            raise ValueError("Oy 1 dan 12 gacha bo'lishi kerak")
        return v

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("To'lov summasi 0 dan katta bo'lishi kerak")
        return v


class PaymentResponse(BaseModel):
    id: int
    student_id: int
    group_id: int
    amount: int
    payment_date: date
    payment_method: PaymentMethod
    period_year: int
    period_month: int
    note: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class PaymentSummary(BaseModel):
    student_id: int
    student_name: str
    group_id: int
    period_year: int
    period_month: int
    total_paid: int
    monthly_fee: int
    debt: int          # Qarzdorlik (monthly_fee - total_paid)
