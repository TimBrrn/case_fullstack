import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";

interface TextBlockProps {
  content: string;
}

export const TextBlock = ({ content }: TextBlockProps) => {
  const clean = content.replace(/<\/?thinking>/g, "");
  if (!clean.trim()) return null;
  return (
    <div className="text-sm text-gray-800 prose prose-sm max-w-none bg-white rounded-xl p-4 border">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{clean}</ReactMarkdown>
    </div>
  );
};
