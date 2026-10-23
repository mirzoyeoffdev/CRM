from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.group import Group
from models.enrollment import Enrollment
from schemas.group import GroupCreate, GroupUpdate, GroupResponse

router = APIRouter(prefix="/groups", tags=["Guruhlar"])


@router.get("/", response_model=List[GroupResponse], summary="Barcha guruhlarni ko'rish")
def get_groups(db: Session = Depends(get_db)):
    return db.query(Group).all()


@router.post("/", response_model=GroupResponse, status_code=201, summary="Yangi guruh yaratish")
def create_group(group: GroupCreate, db: Session = Depends(get_db)):
    existing = db.query(Group).filter(Group.name == group.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu nomli guruh allaqachon mavjud")
    db_group = Group(**group.model_dump())
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group


@router.get("/{group_id}", response_model=GroupResponse, summary="Guruhni ID bo'yicha ko'rish")
def get_group(group_id: int, db: Session = Depends(get_db)):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Guruh topilmadi")
    return group


@router.patch("/{group_id}", response_model=GroupResponse, summary="Guruhni tahrirlash")
def update_group(group_id: int, update: GroupUpdate, db: Session = Depends(get_db)):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Guruh topilmadi")
    for field, value in update.model_dump(exclude_none=True).items():
        setattr(group, field, value)
    db.commit()
    db.refresh(group)
    return group


@router.delete("/{group_id}", status_code=204, summary="Guruhni o'chirish")
def delete_group(group_id: int, db: Session = Depends(get_db)):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Guruh topilmadi")
    db.delete(group)
    db.commit()


@router.get("/{group_id}/students", summary="Guruh o'quvchilari ro'yxati")
def get_group_students(group_id: int, db: Session = Depends(get_db)):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Guruh topilmadi")
    active_enrollments = (
        db.query(Enrollment)
        .filter(Enrollment.group_id == group_id, Enrollment.is_active == True)
        .all()
    )
    students = []
    for e in active_enrollments:
        s = e.student
        students.append({
            "id": s.id,
            "full_name": f"{s.first_name} {s.last_name}",
            "phone": s.phone,
            "enrollment_id": e.id,
            "start_date": e.start_date,
        })
    return {
        "group_id": group_id,
        "group_name": group.name,
        "total_students": len(students),
        "max_students": group.max_students,
        "students": students,
    }
