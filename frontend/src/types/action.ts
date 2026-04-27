import type { SSEEvent } from "@/types/events";

export type Action =
  | { type: "STREAM_START"; payload: string }
  | { type: "SSE_EVENT"; payload: SSEEvent }
  | { type: "STREAM_END" }
  | { type: "ERROR"; payload: string };
