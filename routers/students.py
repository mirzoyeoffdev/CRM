from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.student import Student
from schemas.student import StudentCreate, StudentUpdate, StudentResponse

router = APIRouter(prefix="/students", tags=["O'quvchilar"])


@router.get("/", response_model=List[StudentResponse], summary="Barcha o'quvchilarni ko'rish")
def get_students(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    search: Optional[str] = Query(None, description="Ism yoki telefon bo'yicha qidirish"),
    db: Session = Depends(get_db),
):
    query = db.query(Student)
    if is_active is not None:
        query = query.filter(Student.is_active == is_active)
    if search:
        like = f"%{search}%"
        query = query.filter(
            Student.first_name.ilike(like)
            | Student.last_name.ilike(like)
            | Student.phone.ilike(like)
        )
    return query.offset(skip).limit(limit).all()


@router.post("/", response_model=StudentResponse, status_code=201, summary="Yangi o'quvchi qo'shish")
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    # Telefon raqami takrorlanmasligi tekshiruvi
    existing = db.query(Student).filter(Student.phone == student.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu telefon raqami allaqachon ro'yxatda bor")
    db_student = Student(**student.model_dump())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student


@router.get("/{student_id}", response_model=StudentResponse, summary="O'quvchini ID bo'yicha ko'rish")
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="O'quvchi topilmadi")
    return student


@router.put("/{student_id}", response_model=StudentResponse, summary="O'quvchini tahrirlash")
def update_student(student_id: int, update: StudentUpdate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="O'quvchi topilmadi")
    for field, value in update.model_dump(exclude_none=True).items():
        setattr(student, field, value)
    db.commit()
    db.refresh(student)
    return student


@router.delete("/{student_id}", status_code=204, summary="O'quvchini o'chirish")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="O'quvchi topilmadi")
    db.delete(student)
    db.commit()
