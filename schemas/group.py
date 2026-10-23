from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.group import LevelEnum


class GroupBase(BaseModel):
    name: str
    level: LevelEnum
    teacher_name: str
    max_students: int = 15
    monthly_fee: int = 0


class GroupCreate(GroupBase):
    pass


class GroupUpdate(BaseModel):
    name: Optional[str] = None
    level: Optional[LevelEnum] = None
    teacher_name: Optional[str] = None
    max_students: Optional[int] = None
    monthly_fee: Optional[int] = None


class GroupResponse(GroupBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
