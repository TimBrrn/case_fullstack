import type { Action } from "@/types/action";
import type { State } from "@/types/state";

export const chatReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "STREAM_START":
      return {
        messages: [
          ...state.messages,
          { type: "user_message", content: action.payload },
        ],
        status: "streaming",
        error: null,
      };
    case "SSE_EVENT":
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case "STREAM_END":
      if (state.status === "error") return state;
      return { ...state, status: "idle" };
    case "ERROR":
      return { ...state, status: "error", error: action.payload };
    default:
      return state;
  }
};
