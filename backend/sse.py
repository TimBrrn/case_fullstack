import json
import re

from pydantic_ai.messages import TextPart
from pydantic_ai import (
    AgentRunResultEvent,
    FunctionToolCallEvent,
    FunctionToolResultEvent,
    PartStartEvent,
    PartDeltaEvent,
    PartEndEvent,
    TextPartDelta,
)

from backend.session import get_history, save_history


def parse_thinking(text: str):
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


def flush_buffer(text_buffer: str) -> list[dict]:
    """Parse accumulated buffer and return SSE events."""
    events = []
    if text_buffer:
        for event_type, content in parse_thinking(text_buffer):
            events.append(
                {"event": event_type, "data": json.dumps({"content": content})}
            )
    return events


async def stream(question, agent, context, session_id):
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
                for sse_event in flush_buffer(text_buffer):
                    yield sse_event
                text_buffer = ""

            # Agent calls a tool
            elif isinstance(event, FunctionToolCallEvent):
                for sse_event in flush_buffer(text_buffer):
                    yield sse_event
                text_buffer = ""

                args = event.part.args
                if isinstance(args, str):
                    args = json.loads(args)
                yield {
                    "event": "tool_call_start",
                    "data": json.dumps(
                        {"tool": event.part.tool_name, "args": args or {}}
                    ),
                }

            # Tool returned its result
            elif isinstance(event, FunctionToolResultEvent):
                yield {
                    "event": "tool_call_result",
                    "data": json.dumps(
                        {
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
