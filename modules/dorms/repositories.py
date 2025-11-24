from core.repository import BaseRepository

from .models import Dorm


class DormRepository(BaseRepository[Dorm]):
    def __init__(self) -> None:
        super().__init__(Dorm)

