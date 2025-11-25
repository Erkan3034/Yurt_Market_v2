import pytest
from django.urls import reverse


@pytest.mark.django_db
def test_root_endpoint(client):
    response = client.get(reverse("root"))
    assert response.status_code == 200
    assert response.json()["name"] == "Yurt Market API"


@pytest.mark.django_db
def test_health_endpoint(client):
    response = client.get(reverse("healthcheck"))
    assert response.status_code == 200
    assert "status" in response.json()

