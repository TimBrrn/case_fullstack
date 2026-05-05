import { useState } from "react";

import type { State } from "@/types/state";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Suggestions } from "./Suggestions";

interface HomePageProps {
  status: State["status"];
  sendMessage: (question: string) => void;
}

export function HomePage({ status, sendMessage }: HomePageProps) {
  const [homeInput, setHomeInput] = useState("");

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!homeInput.trim()) return;
    sendMessage(homeInput);
    setHomeInput("");
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-3">
      <h2 className="text-3xl font-semibold mb-10">Explore your data</h2>

      <form
        onSubmit={handleSubmit}
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
                handleSubmit(e);
              }
            }}
          />
          <Button
            type="submit"
            disabled={status === "streaming" || !homeInput.trim()}
            size="icon"
            className="absolute bottom-2 right-2 bg-indigo-600 hover:bg-indigo-700 rounded-full h-8 w-8"
          >
            {status === "streaming" ? "..." : "→"}
          </Button>
        </div>
      </form>

      <p className="text-xs text-gray-400 mt-2 italic">
        The agent may make errors. Verify important results.
      </p>

      <Suggestions onSelect={sendMessage} />
    </div>
  );
}
