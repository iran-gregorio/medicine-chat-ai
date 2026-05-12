import pytest
from fastapi.testclient import TestClient
from main import app
from auth import get_current_user
import io

# Sobrescrever a dependência de autenticação para testes
def override_get_current_user():
    return "testuser"

app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)

@pytest.mark.asyncio
async def test_chat_endpoint(mocker):
    # Fazer mock do LLM para evitar chamadas reais à API
    mock_llm = mocker.patch("routers.chat.get_llm")
    mock_vectorstore = mocker.patch("routers.chat.get_vectorstore")
    
    mock_response = mocker.Mock()
    mock_response.content = "Resposta mockada do LLM"
    mock_llm.return_value.invoke.return_value = mock_response

    response = client.post(
        "/chat/",
        json={"message": "Olá, qual o remédio?", "session_id": "123"}
    )
    
    assert response.status_code == 200
    assert response.json()["reply"] == "Resposta mockada do LLM"
    assert response.json()["session_id"] == "123"

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
    assert "processamento agendado" in response.json()["message"].lower()

def test_image_upload_invalid_type():
    file_content = b"fake pdf content"
    file = io.BytesIO(file_content)
    
    response = client.post(
        "/images/upload",
        files={"file": ("test.pdf", file, "application/pdf")}
    )
    
    assert response.status_code == 400
    assert "imagem" in response.json()["detail"].lower()
