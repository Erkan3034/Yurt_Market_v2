from __future__ import annotations

from typing import Generic, Optional, Type, TypeVar

from django.db import models


T = TypeVar("T", bound=models.Model)


class BaseRepository(Generic[T]):
    """Thin wrapper around a model for enforcing query boundaries."""

    model: Type[T]

    def __init__(self, model: Type[T]) -> None:
        self.model = model

    def create(self, **data) -> T:
        return self.model.objects.create(**data)

    def get(self, **filters) -> T:
        return self.model.objects.get(**filters)

    def filter(self, **filters):
        return self.model.objects.filter(**filters)

    def update(self, instance: T, **data) -> T:
        for attr, value in data.items():
            setattr(instance, attr, value)
        instance.save(update_fields=list(data.keys()))
        return instance

    def delete(self, instance: T) -> None:
        instance.delete()

    def first(self, **filters) -> Optional[T]:
        return self.filter(**filters).first()

    def update_or_create(self, defaults=None, **filters):
        return self.model.objects.update_or_create(defaults=defaults, **filters)

