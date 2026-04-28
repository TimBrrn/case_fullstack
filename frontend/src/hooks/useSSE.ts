import { useCallback } from "react";

import type { SSEEvent } from "@/types/events";
import type { Action } from "@/types/action";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

type Dispatch = React.Dispatch<Action>;

function getSessionId() {
  let id = sessionStorage.getItem("chat_session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("chat_session_id", id);
  }
  return id;
}

// Parse raw SSE lines and dispatch each event to the reducer
function parseSSELines(lines: string[], dispatch: Dispatch) {
  let eventType = "";
  for (const line of lines) {
    if (line.startsWith("event: ")) {
      eventType = line.slice(7).trim();
    } else if (line.startsWith("data: ") && eventType) {
      const data = JSON.parse(line.slice(6));
      if (eventType === "error") {
        dispatch({ type: "ERROR", payload: data.message });
      } else if (eventType !== "done") {
        const sseEvent = { type: eventType, ...data } as SSEEvent;
        dispatch({ type: "SSE_EVENT", payload: sseEvent });
      }
      eventType = "";
    }
  }
}

export const useSSE = (dispatch: Dispatch) => {
  const sendMessage = useCallback(
    async (question: string) => {
      dispatch({ type: "STREAM_START", payload: question });

      try {
        const response = await fetch(`${API_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, session_id: getSessionId() }),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        if (!response.body) {
          throw new Error("Empty response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          parseSSELines(lines, dispatch);
        }

        dispatch({ type: "STREAM_END" });
      } catch (error) {
        dispatch({
          type: "ERROR",
          payload: error instanceof Error ? error.message : "unknown error",
        });
      }
    },
    [dispatch],
  );
  return sendMessage;
};
