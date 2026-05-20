from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Medicine Chat AI API"}

def test_read_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "scheduler" in data
    assert "running" in data["scheduler"]
    assert "next_purge_run" in data["scheduler"]
