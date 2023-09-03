import React, { useEffect } from "react";
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

const Chat: React.FC = () => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const [chat, setChat] = React.useState<string[]>([]);

  useEffect(() => {
    socket.emit("loadMessages", (message: string[]) => {
      setChat(message);
    });

    socket.on("loadMessages", (message: string[]) => {
      setChat(message);
    });

    // Listen for new messages from server
    socket.on("message", (message: string) => {
      setChat([...chat, message]);
    });
  }, [chat]);

  const onSubmit = (data: Inputs) => {
    socket.emit("message", data.message);
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
      textAlign={'start'}
      flexDir={'column'}
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
        textColor={'gray.500'}
      >
        <List spacing={2}>
          {chat.map((message, index) => (
            <ListItem key={index}>
              <Text fontFamily="Roboto">
                {message}
              </Text>
            </ListItem>
          ))}
        </List>
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
        <Box w="100%" margin={5} flex={"row"} textAlign={'center'}>
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
