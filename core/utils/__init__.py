from django.utils.text import slugify


def slugify_with_dorm(value: str, dorm_code: str) -> str:
    """Create deterministic slugs across dorm namespaces."""
    return slugify(f"{dorm_code}-{value}")

