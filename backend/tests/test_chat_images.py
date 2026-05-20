import pytest
import uuid
import io
from fastapi.testclient import TestClient

from main import app
from auth import get_current_user

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_auth():
    user_id = str(uuid.uuid4())
    app.dependency_overrides[get_current_user] = lambda: user_id
    yield user_id
    app.dependency_overrides.pop(get_current_user, None)


def test_image_upload_endpoint():
    # Cria um arquivo falso para upload
    file_content = b"fake image content"
    file = io.BytesIO(file_content)
    
    response = client.post(
        "/images/upload",
        files={"file": ("test.jpg", file, "image/jpeg")}
    )
    
    assert response.status_code == 200
    assert response.json()["filename"] == "test.jpg"
    assert "processada com sucesso" in response.json()["message"].lower()

def test_image_upload_invalid_type():
    file_content = b"fake pdf content"
    file = io.BytesIO(file_content)
    
    response = client.post(
        "/images/upload",
        files={"file": ("test.pdf", file, "application/pdf")}
    )
    
    assert response.status_code == 400
    assert "imagem" in response.json()["detail"].lower()
