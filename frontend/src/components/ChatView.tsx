import { useEffect, useRef } from "react";

import type { State } from "@/types/state";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { LoadingIndicator } from "./LoadingIndicator";

interface ChatViewProps {
  state: State;
  sendMessage: (question: string) => void;
}

export function ChatView({ state, sendMessage }: ChatViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [state.messages]);

  const handleRetry = () => {
    const lastUserMsg = state.messages.findLast(
      (m) => m.type === "user_message",
    );
    if (lastUserMsg && "content" in lastUserMsg) {
      sendMessage(lastUserMsg.content);
    }
  };

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
        <MessageList
          messages={state.messages}
          isStreaming={state.status === "streaming"}
        />

        {state.status === "streaming" && <LoadingIndicator />}

        {state.status === "error" && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mt-4">
            <span className="text-red-500 text-sm flex-1">
              {state.error}
            </span>
            <button
              className="text-xs px-3 py-1 bg-red-100 text-red-600 rounded cursor-pointer hover:bg-red-200"
              onClick={handleRetry}
            >
              Retry
            </button>
          </div>
        )}
      </div>
      <ChatInput
        onSubmit={sendMessage}
        isStreaming={state.status === "streaming"}
      />
    </>
  );
}
