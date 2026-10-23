from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.schedule import Schedule
from models.group import Group
from schemas.schedule import ScheduleCreate, ScheduleResponse

router = APIRouter(prefix="/schedules", tags=["Dars jadvali"])


@router.post("/", response_model=ScheduleResponse, status_code=201, summary="Jadvalga dars qo'shish")
def create_schedule(data: ScheduleCreate, db: Session = Depends(get_db)):
    if not db.query(Group).filter(Group.id == data.group_id).first():
        raise HTTPException(status_code=404, detail="Guruh topilmadi")

    # Bir xil kun uchun qayta qo'shmaslik
    existing = db.query(Schedule).filter(
        Schedule.group_id == data.group_id,
        Schedule.weekday == data.weekday,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu kun uchun jadval allaqachon mavjud")

    schedule = Schedule(**data.model_dump())
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule


@router.get("/group/{group_id}", response_model=List[ScheduleResponse], summary="Guruh jadvali")
def get_group_schedule(group_id: int, db: Session = Depends(get_db)):
    if not db.query(Group).filter(Group.id == group_id).first():
        raise HTTPException(status_code=404, detail="Guruh topilmadi")
    return (
        db.query(Schedule)
        .filter(Schedule.group_id == group_id)
        .order_by(Schedule.weekday)
        .all()
    )


@router.delete("/{schedule_id}", status_code=204, summary="Jadvaldan darsni o'chirish")
def delete_schedule(schedule_id: int, db: Session = Depends(get_db)):
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Jadval yozuvi topilmadi")
    db.delete(schedule)
    db.commit()
