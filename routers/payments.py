from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.payment import Payment
from models.student import Student
from models.group import Group
from models.enrollment import Enrollment
from schemas.payment import PaymentCreate, PaymentResponse, PaymentSummary

router = APIRouter(prefix="/payments", tags=["To'lovlar"])


@router.post("/", response_model=PaymentResponse, status_code=201, summary="To'lov kiritish")
def create_payment(data: PaymentCreate, db: Session = Depends(get_db)):
    if not db.query(Student).filter(Student.id == data.student_id).first():
        raise HTTPException(status_code=404, detail="O'quvchi topilmadi")
    if not db.query(Group).filter(Group.id == data.group_id).first():
        raise HTTPException(status_code=404, detail="Guruh topilmadi")

    payment = Payment(**data.model_dump())
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


@router.get("/", response_model=List[PaymentResponse], summary="Barcha to'lovlar")
def get_all_payments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return db.query(Payment).order_by(Payment.payment_date.desc()).offset(skip).limit(limit).all()


@router.get("/student/{student_id}", response_model=List[PaymentResponse], summary="O'quvchi to'lovlari")
def get_student_payments(
    student_id: int,
    group_id: Optional[int] = None,
    year: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    if not db.query(Student).filter(Student.id == student_id).first():
        raise HTTPException(status_code=404, detail="O'quvchi topilmadi")
    q = db.query(Payment).filter(Payment.student_id == student_id)
    if group_id:
        q = q.filter(Payment.group_id == group_id)
    if year:
        q = q.filter(Payment.period_year == year)
    return q.order_by(Payment.period_year.desc(), Payment.period_month.desc()).all()


@router.get("/debtors", response_model=List[PaymentSummary], summary="Qarzdorlar ro'yxati")
def get_debtors(
    year: int = Query(..., description="Yil"),
    month: int = Query(..., ge=1, le=12, description="Oy (1-12)"),
    db: Session = Depends(get_db),
):
    """
    Berilgan yil va oy uchun to'liq to'lamagan o'quvchilar ro'yxati.
    """
    # Faol yozilishlarni olamiz
    enrollments = db.query(Enrollment).filter(Enrollment.is_active == True).all()
    debtors = []

    for e in enrollments:
        group = e.group
        student = e.student
        if group.monthly_fee <= 0:
            continue

        # Ushbu oy uchun to'lovlar yig'indisi
        payments = db.query(Payment).filter(
            Payment.student_id == e.student_id,
            Payment.group_id == e.group_id,
            Payment.period_year == year,
            Payment.period_month == month,
        ).all()
        total_paid = sum(p.amount for p in payments)
        debt = group.monthly_fee - total_paid

        if debt > 0:
            debtors.append(PaymentSummary(
                student_id=student.id,
                student_name=f"{student.first_name} {student.last_name}",
                group_id=group.id,
                period_year=year,
                period_month=month,
                total_paid=total_paid,
                monthly_fee=group.monthly_fee,
                debt=debt,
            ))

    # Eng ko'p qarzdordan boshlash
    return sorted(debtors, key=lambda x: x.debt, reverse=True)


@router.delete("/{payment_id}", status_code=204, summary="To'lovni o'chirish")
def delete_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="To'lov topilmadi")
    db.delete(payment)
    db.commit()
