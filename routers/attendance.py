from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from database import get_db
from models.attendance import Attendance, AttendanceStatus
from models.student import Student
from models.group import Group
from schemas.attendance import AttendanceCreate, AttendanceUpdate, AttendanceResponse, AttendanceSummary

router = APIRouter(prefix="/attendance", tags=["Davomat"])


@router.post("/", response_model=AttendanceResponse, status_code=201, summary="Davomat belgilash")
def mark_attendance(data: AttendanceCreate, db: Session = Depends(get_db)):
    # Tekshirish
    if not db.query(Student).filter(Student.id == data.student_id).first():
        raise HTTPException(status_code=404, detail="O'quvchi topilmadi")
    if not db.query(Group).filter(Group.id == data.group_id).first():
        raise HTTPException(status_code=404, detail="Guruh topilmadi")

    # Bir xil kun uchun qayta belgilashni tekshirish
    existing = db.query(Attendance).filter(
        Attendance.student_id == data.student_id,
        Attendance.group_id == data.group_id,
        Attendance.date == data.date,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu kun uchun davomat allaqachon belgilangan")

    att = Attendance(**data.model_dump())
    db.add(att)
    db.commit()
    db.refresh(att)
    return att


@router.patch("/{attendance_id}", response_model=AttendanceResponse, summary="Davomatni o'zgartirish")
def update_attendance(attendance_id: int, update: AttendanceUpdate, db: Session = Depends(get_db)):
    att = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not att:
        raise HTTPException(status_code=404, detail="Davomat yozuvi topilmadi")
    for field, value in update.model_dump(exclude_none=True).items():
        setattr(att, field, value)
    db.commit()
    db.refresh(att)
    return att


@router.get("/student/{student_id}", response_model=List[AttendanceResponse], summary="O'quvchi davomati")
def get_student_attendance(
    student_id: int,
    group_id: Optional[int] = None,
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    if not db.query(Student).filter(Student.id == student_id).first():
        raise HTTPException(status_code=404, detail="O'quvchi topilmadi")
    q = db.query(Attendance).filter(Attendance.student_id == student_id)
    if group_id:
        q = q.filter(Attendance.group_id == group_id)
    if from_date:
        q = q.filter(Attendance.date >= from_date)
    if to_date:
        q = q.filter(Attendance.date <= to_date)
    return q.order_by(Attendance.date.desc()).all()


@router.get("/group/{group_id}", response_model=List[AttendanceResponse], summary="Guruh davomati")
def get_group_attendance(
    group_id: int,
    attendance_date: Optional[date] = Query(None, description="Muayyan kun uchun"),
    db: Session = Depends(get_db),
):
    if not db.query(Group).filter(Group.id == group_id).first():
        raise HTTPException(status_code=404, detail="Guruh topilmadi")
    q = db.query(Attendance).filter(Attendance.group_id == group_id)
    if attendance_date:
        q = q.filter(Attendance.date == attendance_date)
    return q.order_by(Attendance.date.desc()).all()


@router.get("/group/{group_id}/summary", response_model=List[AttendanceSummary], summary="Guruh davomati xulosasi")
def get_group_attendance_summary(group_id: int, db: Session = Depends(get_db)):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Guruh topilmadi")

    records = db.query(Attendance).filter(Attendance.group_id == group_id).all()

    # Student bo'yicha guruhlash
    student_map: dict = {}
    for r in records:
        sid = r.student_id
        if sid not in student_map:
            s = r.student
            student_map[sid] = {
                "student_id": sid,
                "student_name": f"{s.first_name} {s.last_name}",
                "present": 0, "absent": 0, "late": 0, "excused": 0,
            }
        student_map[sid][r.status.value] += 1

    summaries = []
    for sid, data in student_map.items():
        total = data["present"] + data["absent"] + data["late"] + data["excused"]
        rate = round((data["present"] + data["late"]) / total * 100, 1) if total > 0 else 0.0
        summaries.append(AttendanceSummary(
            student_id=sid,
            student_name=data["student_name"],
            total_lessons=total,
            present=data["present"],
            absent=data["absent"],
            late=data["late"],
            excused=data["excused"],
            attendance_rate=rate,
        ))
    return summaries
