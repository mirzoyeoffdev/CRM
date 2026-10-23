from sqlalchemy import Column, Integer, String, Enum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base


class LevelEnum(str, enum.Enum):
    beginner = "beginner"
    elementary = "elementary"
    pre_intermediate = "pre-intermediate"
    intermediate = "intermediate"
    upper_intermediate = "upper-intermediate"
    advanced = "advanced"


class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)  # e.g. "A1-Ertalab", "B2-Kechki"
    level = Column(Enum(LevelEnum), nullable=False)
    teacher_name = Column(String(200), nullable=False)
    max_students = Column(Integer, default=15)
    monthly_fee = Column(Integer, default=0)  # so'm hisobida
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    enrollments = relationship("Enrollment", back_populates="group", cascade="all, delete-orphan")
    attendances = relationship("Attendance", back_populates="group", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="group", cascade="all, delete-orphan")
    grades = relationship("Grade", back_populates="group", cascade="all, delete-orphan")
    schedules = relationship("Schedule", back_populates="group", cascade="all, delete-orphan")
