from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.enrollment import Enrollment
from models.student import Student
from models.group import Group
from schemas.enrollment import EnrollmentCreate, EnrollmentUpdate, EnrollmentResponse

router = APIRouter(prefix="/enrollments", tags=["Guruhga yozish"])


@router.post("/", response_model=EnrollmentResponse, status_code=201, summary="O'quvchini guruhga yozish")
def enroll_student(data: EnrollmentCreate, db: Session = Depends(get_db)):
    # Student va group mavjudligini tekshirish
    student = db.query(Student).filter(Student.id == data.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="O'quvchi topilmadi")
    group = db.query(Group).filter(Group.id == data.group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Guruh topilmadi")

    # Allaqachon yozilganligini tekshirish
    existing = db.query(Enrollment).filter(
        Enrollment.student_id == data.student_id,
        Enrollment.group_id == data.group_id,
        Enrollment.is_active == True,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="O'quvchi bu guruhda allaqachon o'qiyapti")

    # Guruh to'liqligini tekshirish
    current_count = db.query(Enrollment).filter(
        Enrollment.group_id == data.group_id,
        Enrollment.is_active == True,
    ).count()
    if current_count >= group.max_students:
        raise HTTPException(status_code=400, detail=f"Guruh to'liq ({group.max_students} o'quvchi)")

    enrollment = Enrollment(**data.model_dump())
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


@router.get("/", response_model=List[EnrollmentResponse], summary="Barcha yozilishlarni ko'rish")
def get_enrollments(db: Session = Depends(get_db)):
    return db.query(Enrollment).all()


@router.get("/{enrollment_id}", response_model=EnrollmentResponse, summary="Yozilishni ko'rish")
def get_enrollment(enrollment_id: int, db: Session = Depends(get_db)):
    e = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Yozilish topilmadi")
    return e


@router.patch("/{enrollment_id}", response_model=EnrollmentResponse, summary="Yozilishni yangilash")
def update_enrollment(enrollment_id: int, update: EnrollmentUpdate, db: Session = Depends(get_db)):
    e = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Yozilish topilmadi")
    for field, value in update.model_dump(exclude_none=True).items():
        setattr(e, field, value)
    db.commit()
    db.refresh(e)
    return e


@router.delete("/{enrollment_id}", status_code=204, summary="O'quvchini guruhdan chiqarish")
def remove_enrollment(enrollment_id: int, db: Session = Depends(get_db)):
    e = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Yozilish topilmadi")
    db.delete(e)
    db.commit()
