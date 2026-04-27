from backend.session import get_history, save_history, sessions


class TestSession:
    def setup_method(self):
        """Clear the store before each test."""
        sessions.clear()

    def test_get_unknown_session(self):
        result = get_history("unknown_id")
        assert result == []

    def test_save_then_get(self):
        messages = [{"role": "user", "content": "Hello"}]
        save_history("session_1", messages)
        assert get_history("session_1") == messages

    def test_two_sessions_isolated(self):
        save_history("alice", [{"content": "A"}])
        save_history("bob", [{"content": "B"}])
        assert get_history("alice") == [{"content": "A"}]
        assert get_history("bob") == [{"content": "B"}]

    def test_save_overwrites(self):
        save_history("s1", [{"content": "old"}])
        save_history("s1", [{"content": "new"}])
        assert get_history("s1") == [{"content": "new"}]
