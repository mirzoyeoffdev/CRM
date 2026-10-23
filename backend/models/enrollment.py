from sqlalchemy import Column, Integer, ForeignKey, Date, Boolean, DateTime, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    note = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    student = relationship("Student", back_populates="enrollments")
    group = relationship("Group", back_populates="enrollments")
