import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { useState } from "react";

interface ThinkingBlockProps {
  content: string;
  isStreaming: boolean;
}

export const ThinkingBlock = ({ content, isStreaming }: ThinkingBlockProps) => {
  const [isOpen, setIsOpen] = useState(isStreaming);
  return (
    <Collapsible open={isOpen || isStreaming} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-600 cursor-pointer">
        {isStreaming ? (
          <span className="animate-pulse">Thinking...</span>
        ) : (
          <>
            <span>View reasoning</span>
            <span className="text-[10px]">&#9660;</span>
          </>
        )}
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div
          className={cn(
            "text-xs text-gray-400 mt-1 border-l-2 border-gray-200",
            "pl-3 bg-gray-50 rounded-r p-3 whitespace-pre-wrap",
          )}
        >
          {content}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
