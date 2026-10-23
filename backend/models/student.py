from sqlalchemy import Column, Integer, String, Date, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, nullable=False)
    email = Column(String(150), unique=True, nullable=True)
    birth_date = Column(Date, nullable=True)
    address = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    enrollments = relationship("Enrollment", back_populates="student", cascade="all, delete-orphan")
    attendances = relationship("Attendance", back_populates="student", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="student", cascade="all, delete-orphan")
    grades = relationship("Grade", back_populates="student", cascade="all, delete-orphan")
