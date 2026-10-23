from sqlalchemy import Column, Integer, ForeignKey, Enum, Time, String
from sqlalchemy.orm import relationship
import enum
from database import Base


class WeekDay(int, enum.Enum):
    monday = 1
    tuesday = 2
    wednesday = 3
    thursday = 4
    friday = 5
    saturday = 6
    sunday = 7


class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    weekday = Column(Enum(WeekDay), nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    room = Column(String(50), nullable=True)   # Xona raqami

    # Relationships
    group = relationship("Group", back_populates="schedules")
