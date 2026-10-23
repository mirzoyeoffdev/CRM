from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models.student import Student
from models.group import Group
from models.enrollment import Enrollment
from models.attendance import Attendance, AttendanceStatus
from models.payment import Payment

router = APIRouter(prefix="/reports", tags=["Hisobotlar"])


@router.get("/overview", summary="Umumiy statistika")
def get_overview(db: Session = Depends(get_db)):
    """Tizimning umumiy ko'rinishi."""
    total_students = db.query(Student).count()
    active_students = db.query(Student).filter(Student.is_active == True).count()
    total_groups = db.query(Group).count()
    total_enrollments = db.query(Enrollment).filter(Enrollment.is_active == True).count()

    # Jami to'lovlar
    total_revenue_row = db.query(func.sum(Payment.amount)).scalar()
    total_revenue = total_revenue_row or 0

    return {
        "total_students": total_students,
        "active_students": active_students,
        "inactive_students": total_students - active_students,
        "total_groups": total_groups,
        "active_enrollments": total_enrollments,
        "total_revenue_som": total_revenue,
    }


@router.get("/monthly-revenue", summary="Oylik daromad hisoboti")
def get_monthly_revenue(
    year: int = Query(..., description="Yil"),
    db: Session = Depends(get_db),
):
    """Berilgan yil uchun oylik daromadlar."""
    payments = db.query(Payment).filter(Payment.period_year == year).all()

    monthly: dict = {i: 0 for i in range(1, 13)}
    for p in payments:
        monthly[p.period_month] += p.amount

    month_names = [
        "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
        "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
    ]

    return {
        "year": year,
        "total_revenue": sum(monthly.values()),
        "monthly": [
            {"month": i, "month_name": month_names[i - 1], "revenue": monthly[i]}
            for i in range(1, 13)
        ],
    }


@router.get("/group-stats", summary="Guruhlar statistikasi")
def get_group_stats(db: Session = Depends(get_db)):
    """Har bir guruh uchun o'quvchilar soni va davomat ko'rsatkichi."""
    groups = db.query(Group).all()
    result = []
    for group in groups:
        student_count = db.query(Enrollment).filter(
            Enrollment.group_id == group.id,
            Enrollment.is_active == True,
        ).count()

        total_att = db.query(Attendance).filter(Attendance.group_id == group.id).count()
        present_att = db.query(Attendance).filter(
            Attendance.group_id == group.id,
            Attendance.status.in_([AttendanceStatus.present, AttendanceStatus.late]),
        ).count()
        att_rate = round(present_att / total_att * 100, 1) if total_att > 0 else None

        result.append({
            "group_id": group.id,
            "group_name": group.name,
            "level": group.level,
            "teacher": group.teacher_name,
            "student_count": student_count,
            "max_students": group.max_students,
            "attendance_rate": att_rate,
            "monthly_fee": group.monthly_fee,
        })
    return result


@router.get("/student/{student_id}/full-report", summary="O'quvchi to'liq hisoboti")
def get_student_full_report(student_id: int, db: Session = Depends(get_db)):
    """Bitta o'quvchi uchun to'liq hisobot: guruhlar, davomat, to'lovlar, baholar."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="O'quvchi topilmadi")

    enrollments = db.query(Enrollment).filter(Enrollment.student_id == student_id).all()

    groups_info = []
    for e in enrollments:
        group = e.group

        # Davomat
        att = db.query(Attendance).filter(
            Attendance.student_id == student_id,
            Attendance.group_id == group.id,
        ).all()
        total = len(att)
        present = sum(1 for a in att if a.status in [AttendanceStatus.present, AttendanceStatus.late])
        att_rate = round(present / total * 100, 1) if total > 0 else None

        # To'lovlar
        payments = db.query(Payment).filter(
            Payment.student_id == student_id,
            Payment.group_id == group.id,
        ).all()
        total_paid = sum(p.amount for p in payments)

        groups_info.append({
            "group_id": group.id,
            "group_name": group.name,
            "level": group.level,
            "enrollment_active": e.is_active,
            "start_date": e.start_date,
            "attendance_rate": att_rate,
            "total_lessons": total,
            "total_paid_som": total_paid,
        })

    return {
        "student_id": student.id,
        "full_name": f"{student.first_name} {student.last_name}",
        "phone": student.phone,
        "is_active": student.is_active,
        "groups": groups_info,
    }
