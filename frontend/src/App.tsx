import { useEffect, useReducer, useRef, useState } from "react";
import { BarChart3, Car, TrendingUp, Users } from "lucide-react";

import { chatReducer } from "@/reducer/chatReducer";
import { useSSE } from "@/hooks/useSSE";
import type { State } from "@/types/state";
import { MessageList } from "./components/MessageList";
import { ChatInput } from "./components/ChatInput";
import { Button } from "./components/ui/button";
import { Textarea } from "./components/ui/textarea";
import { cn } from "./lib/utils";
import { LoadingIndicator } from "./components/LoadingIndicator";

const suggestions = [
  { text: "Show me churn rates by contract type", icon: BarChart3 },
  { text: "What are the top 5 most expensive cars?", icon: Car },
  { text: "Monthly revenue trends", icon: TrendingUp },
  { text: "Customer distribution by gender", icon: Users },
];

const initialState: State = {
  messages: [],
  status: "idle",
  error: null,
};

function App() {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const sendMessage = useSSE(dispatch);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [homeInput, setHomeInput] = useState("");

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [state.messages]);

  const handleHomeSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!homeInput.trim()) return;
    sendMessage(homeInput);
    setHomeInput("");
  };

  const isHome = state.messages.length === 0 && state.status === "idle";

  return (
    <div className="w-screen">
      <div className="h-screen flex flex-col px-20">
        <h1 className="text-xl font-semibold p-4 px-8 border-b text-indigo-900">
          Data Analysis Agent
        </h1>

        {isHome ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3">
            <h2 className="text-3xl font-semibold mb-10">Explore your data</h2>

            <form
              onSubmit={handleHomeSubmit}
              className="w-full max-w-xl flex flex-col gap-2"
            >
              <div className="relative w-full rounded-md max-w-xl border border-indigo-600">
                <Textarea
                  value={homeInput}
                  onChange={(e) => setHomeInput(e.target.value)}
                  placeholder="Describe what you want to analyze..."
                  className="min-h-25 text-xs w-[93%]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleHomeSubmit(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  disabled={state.status === "streaming" || !homeInput.trim()}
                  size="icon"
                  className="absolute bottom-2 right-2 bg-indigo-600 hover:bg-indigo-700 rounded-full h-8 w-8"
                >
                  {state.status === "streaming" ? "..." : "→"}
                </Button>
              </div>
            </form>

            <p className="text-xs text-gray-400 mt-2 italic">
              The agent may make errors. Verify important results.
            </p>

            <div className="grid grid-cols-2 gap-2 mt-4 w-full max-w-xl">
              {suggestions.map((s) => (
                <button
                  key={s.text}
                  className={cn(
                    "h-18 flex items-center justify-start gap-3 text-sm text-left p-3 bg-white border rounded-md",
                    "hover:bg-indigo-100 hover:border-gray-300 transition-colors cursor-pointer",
                  )}
                  onClick={() => sendMessage(s.text)}
                >
                  <s.icon className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  {s.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
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
                    onClick={() => {
                      const lastUserMsg = state.messages.findLast(
                        (m) => m.type === "user_message",
                      );
                      if (lastUserMsg && "content" in lastUserMsg) {
                        sendMessage(lastUserMsg.content);
                      }
                    }}
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
        )}
      </div>
    </div>
  );
}

export default App;
