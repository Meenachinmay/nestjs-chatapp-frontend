import "./App.css";
import { ChakraProvider } from "@chakra-ui/react";
import Chat from "./Chat";
import { useState } from "react";

function App() {
  const [username, setUsername] = useState<string | null>(null);

  if (!username) {
    return (
      <div>
        <input
          type="text"
          placeholder="Enter username"
          onBlur={(e) => setUsername(e.target.value)}
        />
        <button onClick={() => setUsername(username)}>Enter Chat</button>
      </div>
    );
  }

  return (
    <ChakraProvider>
      <Chat username={username} />
    </ChakraProvider>
  );
}

export default App;
