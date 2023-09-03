
import "./App.css";
import { ChakraProvider } from "@chakra-ui/react";
import Chat from "./Chat";

function App() {

  return (
    <>
      <ChakraProvider>
        <Chat />
      </ChakraProvider>
    </>
  );
}

export default App;
