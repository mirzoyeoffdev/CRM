"""
Ingliz tili kursi CRM tizimi
============================
Ishga tushirish:
    uvicorn main:app --reload

API hujjati:
    http://localhost:8000/docs      (Swagger UI)
    http://localhost:8000/redoc     (ReDoc)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
import models  # barcha modellarni import qilib, Base ga ro'yxatdan o'tkazish

from routers import (
    students_router,
    groups_router,
    enrollments_router,
    attendance_router,
    payments_router,
    grades_router,
    schedules_router,
    reports_router,
)

# ─── Ma'lumotlar bazasini yaratish ─────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ─── FastAPI ilovasi ────────────────────────────────────────────────────────────
app = FastAPI(
    title="Ingliz Tili Kursi CRM",
    description=(
        "O'quvchilarni boshqarish tizimi:\n"
        "- O'quvchilar va guruhlar CRUD\n"
        "- Davomat kuzatish\n"
        "- To'lovlar va qarzdorlar\n"
        "- Baholar va progress\n"
        "- Dars jadvali\n"
        "- Hisobotlar va statistika"
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS (local frontend uchun) ────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routerlar ──────────────────────────────────────────────────────────────────
app.include_router(students_router)
app.include_router(groups_router)
app.include_router(enrollments_router)
app.include_router(attendance_router)
app.include_router(payments_router)
app.include_router(grades_router)
app.include_router(schedules_router)
app.include_router(reports_router)


# ─── Asosiy sahifa ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Ingliz tili kursi CRM tizimiga xush kelibsiz!",
        "docs": "http://localhost:8000/docs",
        "version": "1.0.0",
    }
