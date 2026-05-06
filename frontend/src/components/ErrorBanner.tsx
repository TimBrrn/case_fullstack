interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mt-4">
      <span className="text-red-500 text-sm flex-1">{message}</span>
      <button
        className="text-xs px-3 py-1 bg-red-100 text-red-600 rounded cursor-pointer hover:bg-red-200"
        onClick={onRetry}
      >
        Retry
      </button>
    </div>
  );
}
