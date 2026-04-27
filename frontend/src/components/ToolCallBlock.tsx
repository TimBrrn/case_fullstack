import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

interface ToolCallBlockProps {
  tool: string;
  args: Record<string, unknown>;
  result?: string;
}

export function ToolCallBlock({ tool, args, result }: ToolCallBlockProps) {
  const sql = typeof args.sql === "string" ? args.sql : null;
  return (
    <Collapsible>
      <CollapsibleTrigger className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 cursor-pointer">
        <span className="font-medium">{tool}</span>
        {!result && <span className="animate-spin">⏳</span>}
        {result && result.startsWith("Error") && (
          <span className="text-red-400">failed</span>
        )}
        {result && !result.startsWith("Error") && (
          <span className="text-green-500">done</span>
        )}
        <span className="text-[10px]">▼</span>
      </CollapsibleTrigger>

      <CollapsibleContent>
        {sql ? (
          <pre className="text-xs bg-gray-50 text-gray-600 p-3 rounded mt-2 overflow-x-auto border">
            {sql.trim()}
          </pre>
        ) : null}

        {result && result.startsWith("Error") ? (
          <pre className="text-xs text-red-400 mt-2 bg-red-50 p-2 rounded whitespace-pre-wrap border-l-2 border-red-200">
            {result}
          </pre>
        ) : result ? (
          <pre className="text-xs text-gray-500 mt-2 bg-gray-50 p-3 rounded whitespace-pre-wrap border">
            {result}
          </pre>
        ) : null}
      </CollapsibleContent>
    </Collapsible>
  );
}
