from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.grade import Grade
from models.student import Student
from models.group import Group
from schemas.grade import GradeCreate, GradeResponse, GradeSummary

router = APIRouter(prefix="/grades", tags=["Baholar"])


@router.post("/", response_model=GradeResponse, status_code=201, summary="Baho kiritish")
def create_grade(data: GradeCreate, db: Session = Depends(get_db)):
    if not db.query(Student).filter(Student.id == data.student_id).first():
        raise HTTPException(status_code=404, detail="O'quvchi topilmadi")
    if not db.query(Group).filter(Group.id == data.group_id).first():
        raise HTTPException(status_code=404, detail="Guruh topilmadi")
    if data.score > data.max_score:
        raise HTTPException(status_code=400, detail="Ball maksimal balldan katta bo'lishi mumkin emas")

    grade = Grade(**data.model_dump())
    db.add(grade)
    db.commit()
    db.refresh(grade)
    return grade


@router.get("/student/{student_id}", response_model=List[GradeResponse], summary="O'quvchi baholari")
def get_student_grades(
    student_id: int,
    group_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    if not db.query(Student).filter(Student.id == student_id).first():
        raise HTTPException(status_code=404, detail="O'quvchi topilmadi")
    q = db.query(Grade).filter(Grade.student_id == student_id)
    if group_id:
        q = q.filter(Grade.group_id == group_id)
    return q.order_by(Grade.exam_date.desc()).all()


@router.get("/group/{group_id}/summary", response_model=List[GradeSummary], summary="Guruh o'rtacha ballari")
def get_group_grade_summary(group_id: int, db: Session = Depends(get_db)):
    if not db.query(Group).filter(Group.id == group_id).first():
        raise HTTPException(status_code=404, detail="Guruh topilmadi")

    grades = db.query(Grade).filter(Grade.group_id == group_id).all()

    # Student bo'yicha guruhlash
    student_map: dict = {}
    for g in grades:
        sid = g.student_id
        if sid not in student_map:
            s = g.student
            student_map[sid] = {
                "student_id": sid,
                "student_name": f"{s.first_name} {s.last_name}",
                "group_id": group_id,
                "scores": [],
            }
        # Foizga aylantirish
        pct = (g.score / g.max_score) * 100 if g.max_score > 0 else 0
        student_map[sid]["scores"].append(pct)

    summaries = []
    for sid, data in student_map.items():
        avg = round(sum(data["scores"]) / len(data["scores"]), 1) if data["scores"] else 0.0
        summaries.append(GradeSummary(
            student_id=sid,
            student_name=data["student_name"],
            group_id=data["group_id"],
            average_score=avg,
            total_exams=len(data["scores"]),
        ))
    return sorted(summaries, key=lambda x: x.average_score, reverse=True)


@router.delete("/{grade_id}", status_code=204, summary="Bahoni o'chirish")
def delete_grade(grade_id: int, db: Session = Depends(get_db)):
    grade = db.query(Grade).filter(Grade.id == grade_id).first()
    if not grade:
        raise HTTPException(status_code=404, detail="Baho topilmadi")
    db.delete(grade)
    db.commit()
