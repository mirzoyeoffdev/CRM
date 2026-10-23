from routers.students import router as students_router
from routers.groups import router as groups_router
from routers.enrollments import router as enrollments_router
from routers.attendance import router as attendance_router
from routers.payments import router as payments_router
from routers.grades import router as grades_router
from routers.schedules import router as schedules_router
from routers.reports import router as reports_router

__all__ = [
    "students_router",
    "groups_router",
    "enrollments_router",
    "attendance_router",
    "payments_router",
    "grades_router",
    "schedules_router",
    "reports_router",
]
