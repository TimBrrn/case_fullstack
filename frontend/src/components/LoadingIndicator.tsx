export const LoadingIndicator = () => {
  return (
    <div className="flex items-center gap-2 text-sm text-indigo-500 my-8 p-3">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
      </div>
    </div>
  );
};
