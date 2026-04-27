import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const suggestions = [
  "Churn rates by contract type",
  "Top 5 most expensive cars",
  "Revenue trends by month",
  "Customer distribution by gender",
];

interface ChatInputProps {
  onSubmit: (question: string) => void;
  isStreaming: boolean;
}

export const ChatInput = ({ onSubmit, isStreaming }: ChatInputProps) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    onSubmit(input);
    setInput("");
  };

  return (
    <div className="border-t p-4">
      <div className="flex flex-wrap gap-2 mb-3">
        {suggestions.map((s) => (
          <button
            key={s}
            disabled={isStreaming}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onSubmit(s)}
          >
            {s}
          </button>
        ))}
      </div>
      <form
        className="flex items-center gap-3 p-3 bg-white border rounded-xl shadow-sm"
        onSubmit={handleSubmit}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a follow-up question..."
          disabled={isStreaming}
          className="flex-1 border-0 focus-visible:ring-0 shadow-none text-sm"
        />
        <Button
          type="submit"
          disabled={isStreaming || !input.trim()}
          size="icon"
          className="bg-indigo-600 hover:bg-indigo-700 rounded-full h-8 w-8"
        >
          {isStreaming ? "..." : "→"}
        </Button>
      </form>
    </div>
  );
};
