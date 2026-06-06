import pytest
import uuid
import io
from unittest.mock import patch, AsyncMock
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

@patch("routers.images.get_llm")
@patch("routers.images.get_vectorstore")
def test_image_upload_endpoint(mock_get_vectorstore, mock_get_llm):
    # Mock LLM response
    mock_llm = AsyncMock()
    mock_llm.ainvoke.return_value.content = "Paciente: João. Medicamento: Amoxicilina 500mg"
    mock_get_llm.return_value = mock_llm
    
    # Mock Vectorstore response
    mock_vs = AsyncMock()
    mock_doc = AsyncMock()
    mock_doc.page_content = "Amoxicilina é um antibiótico..."
    mock_vs.asimilarity_search.return_value = [mock_doc]
    mock_get_vectorstore.return_value = mock_vs
    
    # Cria um arquivo falso para upload
    file_content = b"fake image content"
    file = io.BytesIO(file_content)
    
    response = client.post(
        "/images/upload",
        files={"file": ("test.jpg", file, "image/jpeg")}
    )
    
    assert response.status_code == 200
    assert response.json()["filename"] == "test.jpg"
    assert "processada" in response.json()["message"].lower()
    assert "Amoxicilina" in response.json()["anonymized_preview"]
    assert "João" not in response.json()["anonymized_preview"] # Deve ter sido anonimizado

def test_image_upload_invalid_type():
    file_content = b"fake pdf content"
    file = io.BytesIO(file_content)
    
    response = client.post(
        "/images/upload",
        files={"file": ("test.pdf", file, "application/pdf")}
    )
    
    assert response.status_code == 400
    assert "imagem" in response.json()["detail"].lower()
