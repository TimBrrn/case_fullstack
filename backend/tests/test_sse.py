import json
import pytest
from backend.sse import parse_thinking, flush_buffer


# --- parse_thinking ---


class TestParseThinking:
    def test_text_only(self):
        result = parse_thinking("Hello world")
        assert result == [("text", "Hello world")]

    def test_thinking_only(self):
        result = parse_thinking("<thinking>Let me analyze this</thinking>")
        assert result == [("thinking", "Let me analyze this")]

    def test_thinking_then_text(self):
        result = parse_thinking("<thinking>Reasoning here</thinking>Final answer")
        assert result == [("thinking", "Reasoning here"), ("text", "Final answer")]

    def test_text_then_thinking_then_text(self):
        result = parse_thinking("Before<thinking>Middle</thinking>After")
        assert result == [
            ("text", "Before"),
            ("thinking", "Middle"),
            ("text", "After"),
        ]

    def test_empty_thinking_ignored(self):
        result = parse_thinking("<thinking></thinking>Some text")
        assert result == [("text", "Some text")]

    def test_empty_string(self):
        result = parse_thinking("")
        assert result == []

    def test_multiline_thinking(self):
        text = "<thinking>Line 1\nLine 2\nLine 3</thinking>"
        result = parse_thinking(text)
        assert result == [("thinking", "Line 1\nLine 2\nLine 3")]

    def test_multiple_thinking_blocks(self):
        text = "<thinking>First</thinking>Middle<thinking>Second</thinking>End"
        result = parse_thinking(text)
        assert result == [
            ("thinking", "First"),
            ("text", "Middle"),
            ("thinking", "Second"),
            ("text", "End"),
        ]


# --- flush_buffer ---


class TestFlushBuffer:
    def test_empty_buffer(self):
        result = flush_buffer("")
        assert result == []

    def test_text_buffer(self):
        result = flush_buffer("Hello world")
        assert len(result) == 1
        assert result[0]["event"] == "text"
        assert json.loads(result[0]["data"]) == {"content": "Hello world"}

    def test_thinking_buffer(self):
        result = flush_buffer("<thinking>Reasoning</thinking>Answer")
        assert len(result) == 2
        assert result[0]["event"] == "thinking"
        assert result[1]["event"] == "text"
        assert json.loads(result[0]["data"]) == {"content": "Reasoning"}
        assert json.loads(result[1]["data"]) == {"content": "Answer"}
