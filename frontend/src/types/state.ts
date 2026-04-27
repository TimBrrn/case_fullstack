import type { SSEEvent } from "@/types/events";

export interface State {
  messages: SSEEvent[];
  status: "idle" | "streaming" | "error";
  error: string | null;
}
