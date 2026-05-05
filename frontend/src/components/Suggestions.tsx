import {
  BarChart3,
  Car,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Button } from "./ui/button";

interface Suggestion {
  text: string;
  icon: LucideIcon;
}

const SUGGESTIONS: Suggestion[] = [
  { text: "Show me churn rates by contract type", icon: BarChart3 },
  { text: "What are the top 5 most expensive cars?", icon: Car },
  { text: "Monthly revenue trends", icon: TrendingUp },
  { text: "Customer distribution by gender", icon: Users },
];

interface SuggestionsProps {
  onSelect: (text: string) => void;
}

export function Suggestions({ onSelect }: SuggestionsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-4 w-full max-w-xl">
      {SUGGESTIONS.map((s) => (
        <Button
          key={s.text}
          variant="outline"
          onClick={() => onSelect(s.text)}
          className="h-18 justify-start gap-3 text-sm text-left p-3 bg-white hover:bg-indigo-100 hover:border-gray-300 cursor-pointer whitespace-normal"
        >
          <s.icon className="w-5 h-5 text-indigo-500 shrink-0" />
          {s.text}
        </Button>
      ))}
    </div>
  );
}
