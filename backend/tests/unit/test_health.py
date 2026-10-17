"""
Unit tests for the /api/v1/health endpoint.
"""


def test_health_check_status_code(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200


def test_health_check_response_body(client):
    response = client.get("/api/v1/health")
    data = response.get_json()
    assert data["status"] == "success"
    assert "version" in data
    assert "message" in data
