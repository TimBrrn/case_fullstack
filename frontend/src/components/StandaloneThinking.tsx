import { ThinkingBlock } from "./ThinkingBlock";

interface StandaloneThinkingProps {
  thinking: string;
  isStreaming: boolean;
}

export function StandaloneThinking({
  thinking,
  isStreaming,
}: StandaloneThinkingProps) {
  return (
    <div className="border rounded-lg p-3">
      <ThinkingBlock content={thinking} isStreaming={isStreaming} />
    </div>
  );
}
