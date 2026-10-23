from sqlalchemy import Column, Integer, ForeignKey, Date, Enum, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base


class PaymentMethod(str, enum.Enum):
    cash = "cash"           # Naqd
    card = "card"           # Karta
    bank = "bank"           # Bank o'tkazmasi
    other = "other"         # Boshqa


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    amount = Column(Integer, nullable=False)           # So'm hisobida
    payment_date = Column(Date, nullable=False)
    payment_method = Column(Enum(PaymentMethod), default=PaymentMethod.cash)
    period_year = Column(Integer, nullable=False)      # To'lov qaysi yil uchun
    period_month = Column(Integer, nullable=False)     # To'lov qaysi oy uchun (1-12)
    note = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    student = relationship("Student", back_populates="payments")
    group = relationship("Group", back_populates="payments")
