import { ThinkingBlock } from "./ThinkingBlock";
import { ToolCallBlock } from "./ToolCallBlock";

interface ThinkingWithToolProps {
  thinking: string;
  isStreaming: boolean;
  tool: string;
  args: Record<string, unknown>;
  result?: string;
}

export function ThinkingWithTool({
  thinking,
  isStreaming,
  tool,
  args,
  result,
}: ThinkingWithToolProps) {
  return (
    <div className="border rounded-lg p-3 space-y-2">
      <ThinkingBlock content={thinking} isStreaming={isStreaming} />
      <ToolCallBlock tool={tool} args={args} result={result} />
    </div>
  );
}
