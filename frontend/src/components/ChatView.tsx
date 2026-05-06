import { useEffect, useRef } from "react";

import type { State } from "@/types/state";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { LoadingIndicator } from "./LoadingIndicator";
import { ErrorBanner } from "./ErrorBanner";

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

        {state.status === "error" && state.error && (
          <ErrorBanner message={state.error} onRetry={handleRetry} />
        )}
      </div>
      <ChatInput
        onSubmit={sendMessage}
        isStreaming={state.status === "streaming"}
      />
    </>
  );
}
