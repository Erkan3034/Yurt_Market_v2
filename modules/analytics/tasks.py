from __future__ import annotations

from celery import shared_task

from .services import AnalyticsService


@shared_task(name="analytics.refresh_popular_sellers")
def refresh_popular_sellers(dorm_id: int) -> None:
    AnalyticsService().generate_popular_sellers(dorm_id)

