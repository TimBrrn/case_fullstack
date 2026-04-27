from fastapi.testclient import TestClient
from backend.app import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_chat_returns_event_stream():
    response = client.post("/chat", json={"question": "test"})
    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]


def test_chat_rejects_empty_question():
    """Empty question should return 422"""
    response = client.post("/chat", json={"question": ""})
    assert response.status_code == 422
