type ThinkingEvent = { type: "thinking"; content: string };
type TextEvent = { type: "text"; content: string };
type ErrorEvent = { type: "error"; message: string };
type DoneEvent = { type: "done" };
type UserMessageEvent = { type: "user_message"; content: string };

type ToolCallStartEvent = {
  type: "tool_call_start";
  tool: string;
  args: Record<string, unknown>;
};

type ToolCallResultEvent = {
  type: "tool_call_result";
  tool: string;
  result: string;
};

export type SSEEvent =
  | ThinkingEvent
  | ToolCallStartEvent
  | ToolCallResultEvent
  | TextEvent
  | ErrorEvent
  | DoneEvent
  | UserMessageEvent;
