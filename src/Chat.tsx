import React, { useEffect, useRef } from "react";
import { Box, Button, List, ListItem, Text, Flex } from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import socket from "./socket";

import "../src/chat.css";

const schema = z.object({
  message: z.string().min(1, "Message should not be empty"),
});

type Inputs = z.infer<typeof schema>;

const Chat: React.FC<{ username: string }> = ({ username }) => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const messageEndRef = useRef<HTMLDivElement>(null);

  const [chat, setChat] = React.useState<string[]>([]);

  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    // Initialize loading previous chat messages from the server
    socket.emit("loadMessages");

    // Listen for a new array of all chat messages
    socket.on(
      "loadMessages",
      (messages: Array<{ content: string; user?: { username: string } }>) => {
        const formattedMessages = messages.map((m) =>
          m.user && m.user.username
            ? `${m.user.username}: ${m.content}`
            : m.content
        );
        setChat(formattedMessages);
      }
    );

    // Listen for new individual chat messages
    socket.on(
      "message",
      (message: { content: string; user?: { username: string } }) => {
        const formattedMessage =
          message.user && message.user.username
            ? `${message.user.username}: ${message.content}`
            : message.content;
        setChat((prevChat) => [...prevChat, formattedMessage]);
      }
    );

    return () => {
      socket.off("message");
      socket.off("loadMessages");
    };
  }, []);

  // This useEffect is for auto-scrolling to the most recent message.
  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const onSubmit = (data: Inputs) => {
    socket.emit("message", { content: data.message, username });
    reset({ message: "" });
  };

  return (
    <Flex
      p={4}
      w="400px"
      borderWidth={2}
      borderRadius="md"
      borderColor="darkgray"
      bg="white"
      align="stretch"
      textAlign={"start"}
      flexDir={"column"}
      gap={5}
    >
      <Box
        h="300px"
        w="100%"
        overflowY="auto"
        borderColor="darkgray"
        borderWidth={1}
        borderRadius="md"
        p={2}
        textColor={"gray.500"}
      >
        <List spacing={2}>
          {chat.map((message, index) => (
            <ListItem key={index}>
              <Text fontFamily="Roboto">{message}</Text>
            </ListItem>
          ))}
        </List>
        <div ref={messageEndRef}></div>
      </Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box w="100%">
          <Controller
            name="message"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <input
                {...field}
                placeholder="Enter your message"
                className="message_input"
                style={{}}
              />
            )}
          />
          {errors.message && (
            <Text fontSize="sm" color="red.500">
              {errors.message.message}
            </Text>
          )}
        </Box>
        <Box w="100%" margin={5} flex={"row"} textAlign={"center"}>
          <Button
            type="submit"
            colorScheme="gray"
            _focus={{ outline: "none" }}
            fontFamily="Roboto"
            _hover={{ border: "0px" }}
            bg={"purple.500"}
            color={"white"}
            paddingX={"10"}
          >
            Send
          </Button>
        </Box>
      </form>
    </Flex>
  );
};

export default Chat;
