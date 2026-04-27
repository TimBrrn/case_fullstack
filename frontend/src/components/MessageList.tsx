import type { SSEEvent } from "@/types/events";
import { TextBlock } from "./TextBlock";
import { ThinkingBlock } from "./ThinkingBlock";
import { DataTable } from "./DataTable";
import { PlotlyChart } from "./PlotlyChart";
import { ToolCallBlock } from "./ToolCallBlock";
import { UserMessage } from "./UserMessage";

interface MessageListProps {
  messages: SSEEvent[];
  isStreaming: boolean;
}

// Parse tool call result to detect visualizations
function parseToolResult(messages: SSEEvent[], toolIndex: number, toolName: string) {
  const resultEvent = messages.find(
    (e, j) => j > toolIndex && e.type === "tool_call_result" && e.tool === toolName,
  );
  const result = resultEvent?.type === "tool_call_result" ? resultEvent.result : undefined;

  let parsed = null;
  if (result) {
    try { parsed = JSON.parse(result); } catch { /* not JSON */ }
  }

  return { result, parsed };
}

export const MessageList = ({ messages, isStreaming }: MessageListProps) => {
  const elements: React.ReactNode[] = [];
  const activeTurnStart = messages.findLastIndex(
    (message) => message.type === "user_message",
  );

  for (let i = 0; i < messages.length; i++) {
    const event = messages[i];

    switch (event.type) {
      case "user_message":
        elements.push(<UserMessage key={i} content={event.content} />);
        break;

      case "thinking": {
        const blockStartIndex = i;
        const blockIsStreaming =
          isStreaming &&
          activeTurnStart !== -1 &&
          blockStartIndex > activeTurnStart;

        // Merge consecutive thinking blocks
        let thinkingContent = event.content;
        while (i + 1 < messages.length && messages[i + 1].type === "thinking") {
          i++;
          thinkingContent += (messages[i] as { type: "thinking"; content: string }).content;
        }

        // If followed by a tool call, group them together
        const nextEvent = messages[i + 1];
        if (nextEvent?.type === "tool_call_start") {
          i++;
          const { result, parsed } = parseToolResult(messages, i, nextEvent.tool);

          if (parsed?.type === "figure" || parsed?.type === "table") {
            // Visualization: thinking block + chart/table rendered separately
            elements.push(
              <div key={i} className="border rounded-lg p-3">
                <ThinkingBlock content={thinkingContent} isStreaming={blockIsStreaming} />
              </div>,
            );
            if (parsed.type === "figure") {
              elements.push(<PlotlyChart key={`viz-${i}`} data={parsed.figure.data} layout={parsed.figure.layout} />);
            } else {
              elements.push(<DataTable key={`viz-${i}`} columns={parsed.columns} rows={parsed.rows} title={parsed.title} />);
            }
          } else {
            // Standard tool call: thinking + tool call in one block
            elements.push(
              <div key={i} className="border rounded-lg p-3 space-y-2">
                <ThinkingBlock content={thinkingContent} isStreaming={blockIsStreaming} />
                <ToolCallBlock tool={nextEvent.tool} args={nextEvent.args} result={result} />
              </div>,
            );
          }
        } else {
          // Standalone thinking block
          elements.push(
            <div key={i} className="border rounded-lg p-3">
              <ThinkingBlock content={thinkingContent} isStreaming={blockIsStreaming} />
            </div>,
          );
        }
        break;
      }

      case "tool_call_start": {
        // Tool call without preceding thinking
        const { result, parsed } = parseToolResult(messages, i, event.tool);

        if (parsed?.type === "figure") {
          elements.push(<PlotlyChart key={i} data={parsed.figure.data} layout={parsed.figure.layout} />);
        } else if (parsed?.type === "table") {
          elements.push(<DataTable key={i} columns={parsed.columns} rows={parsed.rows} title={parsed.title} />);
        } else {
          elements.push(<ToolCallBlock key={i} tool={event.tool} args={event.args} result={result} />);
        }
        break;
      }

      case "tool_call_result":
        break;

      case "text": {
        const blockIsStreaming =
          isStreaming && activeTurnStart !== -1 && i > activeTurnStart;

        // Text followed by a tool call = intermediate reasoning
        const nextNonThinking = messages.slice(i + 1).find((e) => e.type !== "thinking");
        if (nextNonThinking?.type === "tool_call_start") {
          elements.push(
            <div key={i} className="border rounded-lg p-3">
              <ThinkingBlock content={event.content} isStreaming={blockIsStreaming} />
            </div>,
          );
        } else {
          elements.push(<TextBlock key={i} content={event.content} />);
        }
        break;
      }

      default:
        break;
    }
  }

  return <div className="flex flex-col gap-4">{elements}</div>;
};
