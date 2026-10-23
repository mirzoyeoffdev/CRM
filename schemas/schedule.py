from pydantic import BaseModel
from typing import Optional
from datetime import time
from models.schedule import WeekDay


WEEKDAY_NAMES = {
    WeekDay.monday: "Dushanba",
    WeekDay.tuesday: "Seshanba",
    WeekDay.wednesday: "Chorshanba",
    WeekDay.thursday: "Payshanba",
    WeekDay.friday: "Juma",
    WeekDay.saturday: "Shanba",
    WeekDay.sunday: "Yakshanba",
}


class ScheduleCreate(BaseModel):
    group_id: int
    weekday: WeekDay
    start_time: time
    end_time: time
    room: Optional[str] = None


class ScheduleResponse(BaseModel):
    id: int
    group_id: int
    weekday: WeekDay
    start_time: time
    end_time: time
    room: Optional[str]

    model_config = {"from_attributes": True}
