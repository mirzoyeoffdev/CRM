from sqlalchemy import Column, Integer, ForeignKey, Date, Enum, String, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base


class ExamType(str, enum.Enum):
    homework = "homework"     # Uy vazifasi
    quiz = "quiz"             # Kichik test
    midterm = "midterm"       # Oraliq imtihon
    final = "final"           # Yakuniy imtihon
    speaking = "speaking"     # Og'zaki nutq
    writing = "writing"       # Yozma ish


class Grade(Base):
    __tablename__ = "grades"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    exam_type = Column(Enum(ExamType), nullable=False)
    score = Column(Float, nullable=False)
    max_score = Column(Float, nullable=False, default=100.0)
    exam_date = Column(Date, nullable=False)
    note = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    student = relationship("Student", back_populates="grades")
    group = relationship("Group", back_populates="grades")
