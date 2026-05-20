import pytest
from fastapi.testclient import TestClient
from main import app
from database import get_db
from unittest.mock import AsyncMock, MagicMock, patch

client = TestClient(app)

class MockResult:
    def __init__(self, items):
        self.items = items
    
    def scalars(self):
        class Scalars:
            def first(_self):
                return self.items[0] if self.items else None
        return Scalars()

@pytest.mark.asyncio
async def test_register_success():
    mock_db = AsyncMock()
    mock_db.add = MagicMock()
    mock_db.execute.return_value = MockResult([])
    
    app.dependency_overrides[get_db] = lambda: mock_db
    
    response = client.post(
        "/auth/register",
        json={
            "full_name": "Test User",
            "email": "test@example.com",
            "phone": "11999999999",
            "password": "StrongPassword123!"
        }
    )
    
    app.dependency_overrides.pop(get_db, None)
    
    assert response.status_code == 200
    data = response.json()
    assert "registrado com sucesso" in data["message"].lower()

@pytest.mark.asyncio
async def test_register_weak_password():
    response = client.post(
        "/auth/register",
        json={
            "full_name": "Test User",
            "email": "weak@example.com",
            "password": "weak"
        }
    )
    assert response.status_code == 422
    assert "detail" in response.json()

@pytest.mark.asyncio
async def test_login_success():
    mock_db = AsyncMock()
    mock_user = MagicMock()
    mock_user.id = 1
    mock_user.email = "test@example.com"
    mock_user.is_active = True
    mock_user.hashed_password = "$2b$12$e..."
    mock_db.add = MagicMock()
    mock_db.execute.return_value = MockResult([mock_user])
    
    app.dependency_overrides[get_db] = lambda: mock_db
    
    with patch("routers.auth.verify_password", return_value=True), \
         patch("routers.auth.create_access_token", return_value="access_token_123"):
        
        response = client.post(
            "/auth/login",
            json={
                "identifier": "test@example.com",
                "password": "StrongPassword123!"
            }
        )
    
    app.dependency_overrides.pop(get_db, None)
    
    assert response.status_code == 200
    data = response.json()
    assert data["access_token"] == "access_token_123"
    assert "refresh_token" in data

@pytest.mark.asyncio
async def test_login_invalid_credentials():
    mock_db = AsyncMock()
    mock_db.execute.return_value = MockResult([])  # User not found
    
    app.dependency_overrides[get_db] = lambda: mock_db
    
    response = client.post(
        "/auth/login",
        json={
            "identifier": "notfound@example.com",
            "password": "AnyPassword"
        }
    )
    
    app.dependency_overrides.pop(get_db, None)
    
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_refresh_token_success():
    mock_db = AsyncMock()
    mock_db.add = MagicMock()
    mock_token_record = MagicMock()
    mock_token_record.user_id = 1
    from datetime import datetime, timezone, timedelta
    mock_token_record.expires_at = datetime.now(timezone.utc) + timedelta(days=1)
    
    mock_user = MagicMock()
    mock_user.id = 1
    mock_user.email = "test@example.com"
    mock_user.is_active = True
    
    mock_db.execute.side_effect = [MockResult([mock_token_record]), MockResult([mock_user])]
    
    app.dependency_overrides[get_db] = lambda: mock_db
    
    with patch("routers.auth.create_access_token", return_value="new_access_token"):
        response = client.post(
            "/auth/refresh",
            json={"refresh_token": "valid_refresh_token"}
        )
    
    app.dependency_overrides.pop(get_db, None)
    
    assert response.status_code == 200
    data = response.json()
    assert data["access_token"] == "new_access_token"

@pytest.mark.asyncio
async def test_forgot_password():
    mock_db = AsyncMock()
    mock_db.add = MagicMock()
    mock_user = MagicMock()
    mock_user.id = 1
    mock_user.email = "test@example.com"
    mock_user.full_name = "Test User"
    mock_db.execute.return_value = MockResult([mock_user])
    
    app.dependency_overrides[get_db] = lambda: mock_db
    
    with patch("routers.auth.send_password_reset_email"):
        response = client.post(
            "/auth/forgot-password",
            json={"email": "test@example.com"}
        )
    
    app.dependency_overrides.pop(get_db, None)
    
    assert response.status_code == 200
    assert "e-mail" in response.json()["message"].lower()

@pytest.mark.asyncio
async def test_reset_password():
    mock_db = AsyncMock()
    mock_db.add = MagicMock()
    mock_token_record = MagicMock()
    mock_token_record.user_id = 1
    from datetime import datetime, timezone, timedelta
    mock_token_record.expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    mock_user = MagicMock()
    mock_db.execute.side_effect = [MockResult([mock_token_record]), MockResult([mock_user])]
    
    app.dependency_overrides[get_db] = lambda: mock_db
    
    with patch("routers.auth.get_password_hash", return_value="new_hash"):
        response = client.post(
            "/auth/reset-password",
            json={"token": "valid_reset_token", "new_password": "NewStrongPassword123!"}
        )
    
    app.dependency_overrides.pop(get_db, None)
    
    assert response.status_code == 200
    assert "sucesso" in response.json()["message"].lower()
