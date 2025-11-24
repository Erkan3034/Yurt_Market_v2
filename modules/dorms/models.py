from django.db import models

from core.mixins import TimestampedModel
from core.utils import slugify_with_dorm


class Dorm(TimestampedModel):
    name = models.CharField(max_length=125, unique=True)
    code = models.SlugField(max_length=64, unique=True)
    address = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = slugify_with_dorm(self.name, self.name)
        super().save(*args, **kwargs)

