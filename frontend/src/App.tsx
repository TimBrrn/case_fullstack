import { useReducer } from "react";

import { chatReducer } from "@/reducer/chatReducer";
import { useSSE } from "@/hooks/useSSE";
import type { State } from "@/types/state";
import { HomePage } from "./components/HomePage";
import { ChatView } from "./components/ChatView";

const initialState: State = {
  messages: [],
  status: "idle",
  error: null,
};

function App() {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const sendMessage = useSSE(dispatch);

  const isHome = state.messages.length === 0 && state.status === "idle";

  return (
    <div className="w-screen">
      <div className="h-screen flex flex-col px-20">
        <h1 className="text-xl font-semibold p-4 px-8 border-b text-indigo-900">
          Data Analysis Agent
        </h1>

        {isHome ? (
          <HomePage status={state.status} sendMessage={sendMessage} />
        ) : (
          <ChatView state={state} sendMessage={sendMessage} />
        )}
      </div>
    </div>
  );
}

export default App;
