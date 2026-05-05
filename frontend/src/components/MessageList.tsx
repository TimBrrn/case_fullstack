import type { SSEEvent } from "@/types/events";
import { TextBlock } from "./TextBlock";
import { UserMessage } from "./UserMessage";
import { StandaloneThinking } from "./StandaloneThinking";
import { ThinkingWithTool } from "./ThinkingWithTool";
import { ThinkingWithViz, type Visualization } from "./ThinkingWithViz";

interface MessageListProps {
  messages: SSEEvent[];
  isStreaming: boolean;
}

// Merge consecutive thinking events into a single content string.
function mergeAdjacentThinkings(
  messages: SSEEvent[],
  startIndex: number,
): { content: string; endIndex: number } {
  let content = (messages[startIndex] as { type: "thinking"; content: string })
    .content;
  let i = startIndex;
  while (i + 1 < messages.length && messages[i + 1].type === "thinking") {
    i++;
    content += (messages[i] as { type: "thinking"; content: string }).content;
  }
  return { content, endIndex: i };
}

function findToolResult(
  messages: SSEEvent[],
  toolIndex: number,
  toolCallId: string,
) {
  const resultEvent = messages.find(
    (e, j) =>
      j > toolIndex &&
      e.type === "tool_call_result" &&
      e.tool_call_id === toolCallId,
  );

  const result =
    resultEvent?.type === "tool_call_result" ? resultEvent.result : undefined;

  return result;
}

function parseVisualization(result?: string): Visualization | null {
  if (!result) return null;

  try {
    const parsed = JSON.parse(result);
    if (parsed?.type === "figure" || parsed?.type === "table") {
      return parsed as Visualization;
    }
  } catch {
    /* not JSON */
  }

  return null;
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
        const blockIsStreaming =
          isStreaming && activeTurnStart !== -1 && i > activeTurnStart;

        // Merge consecutive thinking blocks
        const { content: thinkingContent, endIndex } = mergeAdjacentThinkings(
          messages,
          i,
        );
        i = endIndex;

        const nextEvent = messages[i + 1];
        if (nextEvent?.type === "tool_call_start") {
          i++;
          const result = findToolResult(
            messages,
            i,
            nextEvent.tool_call_id,
          );
          const visualization = parseVisualization(result);

          if (visualization) {
            elements.push(
              <ThinkingWithViz
                key={i}
                thinking={thinkingContent}
                isStreaming={blockIsStreaming}
                viz={visualization}
              />,
            );
          } else {
            elements.push(
              <ThinkingWithTool
                key={i}
                thinking={thinkingContent}
                isStreaming={blockIsStreaming}
                tool={nextEvent.tool}
                args={nextEvent.args}
                result={result}
              />,
            );
          }
        } else {
          elements.push(
            <StandaloneThinking
              key={i}
              thinking={thinkingContent}
              isStreaming={blockIsStreaming}
            />,
          );
        }
        break;
      }

      case "tool_call_result":
        break;

      case "text": {
        elements.push(<TextBlock key={i} content={event.content} />);
        break;
      }

      default:
        break;
    }
  }

  return <div className="flex flex-col gap-4">{elements}</div>;
};
