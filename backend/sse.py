import json
import re
from typing import Any, Literal, TypedDict
from collections.abc import AsyncIterator

from pydantic_ai.messages import TextPart
from pydantic_ai import (
    Agent,
    AgentRunResultEvent,
    FunctionToolCallEvent,
    FunctionToolResultEvent,
    PartStartEvent,
    PartDeltaEvent,
    PartEndEvent,
    TextPartDelta,
)

from agent.context import AgentContext
from backend.session import get_history, save_history


class SSEMessage(TypedDict):
    event: str
    data: str


ParsedPart = tuple[Literal["thinking", "text"], str]


def parse_thinking(text: str) -> list[ParsedPart]:
    """Separate thinking blocks from text. Returns a list of (type, content)."""
    parts = []
    pattern = re.compile(r"<thinking>(.*?)</thinking>", re.DOTALL)

    last_end = 0
    for match in pattern.finditer(text):
        before = text[last_end : match.start()].strip()
        if before:
            parts.append(("text", before))
        thinking = match.group(1).strip()
        if thinking:
            parts.append(("thinking", thinking))
        last_end = match.end()

    after = text[last_end:].strip()
    if after:
        parts.append(("text", after))

    return parts


def flush_buffer(text_buffer: str) -> list[SSEMessage]:
    """Parse accumulated buffer and return SSE events."""
    events: list[SSEMessage] = []
    if text_buffer:
        for event_type, content in parse_thinking(text_buffer):
            events.append(
                {"event": event_type, "data": json.dumps({"content": content})}
            )
    return events


async def stream(
    question: str,
    agent: Agent[AgentContext, Any],
    context: AgentContext,
    session_id: str,
) -> AsyncIterator[SSEMessage]:
    history = get_history(session_id)
    text_buffer = ""

    try:
        async for event in agent.run_stream_events(
            question, deps=context, message_history=history or None
        ):
            # Start accumulating text
            if isinstance(event, PartStartEvent):
                if isinstance(event.part, TextPart):
                    text_buffer = event.part.content or ""

            # Append text delta
            elif isinstance(event, PartDeltaEvent):
                if isinstance(event.delta, TextPartDelta):
                    text_buffer += event.delta.content_delta

            # Text block complete — flush buffer
            elif isinstance(event, PartEndEvent):
                if isinstance(event.part, TextPart):
                    for sse_event in flush_buffer(text_buffer):
                        yield sse_event
                    text_buffer = ""

            # Agent calls a tool
            elif isinstance(event, FunctionToolCallEvent):
                for sse_event in flush_buffer(text_buffer):
                    yield sse_event
                text_buffer = ""

                args = event.part.args_as_dict()

                yield {
                    "event": "tool_call_start",
                    "data": json.dumps(
                        {
                            "tool_call_id": event.tool_call_id,
                            "tool": event.part.tool_name,
                            "args": args,
                        }
                    ),
                }

            # Tool returned its result
            elif isinstance(event, FunctionToolResultEvent):
                yield {
                    "event": "tool_call_result",
                    "data": json.dumps(
                        {
                            "tool_call_id": event.tool_call_id,
                            "tool": event.result.tool_name,
                            "result": str(event.result.content),
                        }
                    ),
                }

            # Stream complete
            elif isinstance(event, AgentRunResultEvent):
                for sse_event in flush_buffer(text_buffer):
                    yield sse_event
                text_buffer = ""

                save_history(session_id, event.result.all_messages())
                yield {"event": "done", "data": "{}"}

    except Exception as e:
        yield {"event": "error", "data": json.dumps({"message": str(e)})}
        yield {"event": "done", "data": "{}"}
