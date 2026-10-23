from sqlalchemy import Column, Integer, ForeignKey, Date, Enum, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base


class AttendanceStatus(str, enum.Enum):
    present = "present"       # Keldi
    absent = "absent"         # Kelmadi
    late = "late"             # Kech qoldi
    excused = "excused"       # Sababli


class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(Enum(AttendanceStatus), nullable=False, default=AttendanceStatus.present)
    note = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    student = relationship("Student", back_populates="attendances")
    group = relationship("Group", back_populates="attendances")
