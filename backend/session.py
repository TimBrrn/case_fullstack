sessions: dict[str, list] = {}


def get_history(session_id: str) -> list:
    return sessions.get(session_id, [])


def save_history(session_id: str, messages: list) -> None:
    sessions[session_id] = messages
