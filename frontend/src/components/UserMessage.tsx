import { User } from "lucide-react";

export const UserMessage = ({ content }: { content: string }) => {
  return (
    <div className="flex justify-end items-center gap-2">
      <div className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-2xl rounded-br-sm max-w-[80%]">
        {content}
      </div>
      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
        <User className="w-5 h-5 text-indigo-600" />
      </div>
    </div>
  );
};
