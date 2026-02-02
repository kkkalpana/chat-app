import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Flex,
  Icon,
  Avatar,
  InputGroup,
  InputRightElement,
  useToast,
} from "@chakra-ui/react";
import { FiSend, FiInfo, FiMessageCircle } from "react-icons/fi";
import UsersList from "./UsersList";
import { useState, useRef, useEffect } from "react";
import axios from "axios";

const ChatArea = ({ selectedGroup, socket }) => {
  const [message, setMessage] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const toast = useToast();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  const currentUser = JSON.parse(localStorage.getItem("userInfo"));
  useEffect(() => {
    if (selectedGroup && socket) {
      // fetch messages
      fetchMessages();
      socket.emit("joinRoom", selectedGroup._id);
      socket.on("messageReceived", (newMsg) => {
        setMessage((prevMessages) => [...prevMessages, newMsg]);
      });

      socket.on("users in room", (users) => {
        setConnectedUsers(users);
      });

      socket.on("user joined", (user) => {
        setConnectedUsers((prev) => [...prev, user]);
      });

      socket.on("user left", (userId) => {
        setConnectedUsers((prev) => prev.filter((u) => u._id !== userId));
      });

      socket.on("notification", (notification) => {
        toast({
          title:
            notification?.type === "USER_JOINED" ? "New User" : "Notification",
          description: notification?.message,
          status: "info",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      });

      socket.on("typing", ({ username }) => {
        setTypingUsers((prev) => new Set(prev).add(username));
      });

      socket.on("stopTyping", ({ username }) => {
        setTypingUsers((prev) => {
          prev.delete(username);
          return prev;
        });
      });

      //clean up
      return () => {
        socket.emit("leaveRoom", selectedGroup._id);
        socket.off("messageReceived");
        socket.off("users in room");
        socket.off("user joined");
        socket.off("user left");
        socket.off("notification");
        socket.off("typing");
        socket.off("stopTyping");
      };
    }
  }, [selectedGroup, socket, toast]);

  const fetchMessages = async () => {
    const currentUser = JSON.parse(localStorage.getItem("userInfo"));
    const token = currentUser?.token;

    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/messages/${selectedGroup._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setMessage(data.reverse());
    } catch (e) {
      console.log(e);
    }
  };

  // send message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const token = currentUser?.token;
      const data = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/messages`,
        {
          content: newMessage,
          groupId: selectedGroup._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      socket.emit("sendMessage", {
        ...data.data,
        groupId: selectedGroup._id,
      });

      setMessage((prev) => [...prev, data.data]);
      setNewMessage("");
    } catch (e) {
      toast({
        title: "Error sending message",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  // handle typing
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!isTyping && selectedGroup) {
      setIsTyping(true);
      socket.emit("typing", {
        groupId: selectedGroup._id,
        username: currentUser.username,
      });
    }

    // reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // set new time out
    typingTimeoutRef.current = setTimeout(() => {
      if (selectedGroup) {
        socket.emit("stopTyping", {
          groupId: selectedGroup._id,
        });
        setIsTyping(false);
      }
    }, 2000);
  };

  // format time
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // render typing indicator
  const renderTypingIndicator = () => {
    if (typingUsers.size === 0) return null;
    const typingArray = Array.from(typingUsers);
    return typingArray.map((username) => {
      <Box
        key={username}
        alignSelf={
          username === currentUser.username ? "flex-start" : "flex-end"
        }
        maxW="70%"
      >
        <Flex
          align="center"
          bg={username === currentUser.username ? "blue.50" : "gray.100"}
          p={2}
          borderRadius="lg"
          gap={2}
        >
          {username === currentUser?.username ? (
            <>
              <Avatar size="xs" name={username} />
              <Flex align="center" gap={1}>
                <Text fontSize="sm" color="gray.600" fontStyle="italic">
                  You are typing...
                </Text>
                <Flex gap={1}>
                  {[1, 2, 3].map((dot) => {
                    <Box
                      key={dot}
                      w="3px"
                      h="3px"
                      bg="gray.600"
                      borderRadius="full"
                    />;
                  })}
                </Flex>
              </Flex>
            </>
          ) : (
            <>
              <Flex align="center" gap={1}>
                <Text fontSize="sm" color="gray.600" fontStyle="italic">
                  {username} is typing...
                </Text>
                <Flex gap={1}>
                  {[1, 2, 3].map((dot) => {
                    <Box
                      key={dot}
                      w="3px"
                      h="3px"
                      bg="gray.600"
                      borderRadius="full"
                    />;
                  })}
                </Flex>
              </Flex>
              <Avatar size="xs" name={username} />
            </>
          )}
        </Flex>
      </Box>;
    });
  };
  // Sample data for demonstration
  const sampleMessages = [
    {
      id: 1,
      content: "Hey team! Just pushed the new updates to staging.",
      sender: { username: "Sarah Chen" },
      createdAt: "10:30 AM",
      isCurrentUser: false,
    },
    {
      id: 2,
      content: "Great work! The new features look amazing 🚀",
      sender: { username: "Alex Thompson" },
      createdAt: "10:31 AM",
      isCurrentUser: false,
    },
    {
      id: 3,
      content: "Thanks! Let's review it in our next standup.",
      sender: { username: "You" },
      createdAt: "10:32 AM",
      isCurrentUser: true,
    },
  ];

  const sampleUsers = [
    { id: 1, username: "Sarah Chen", isOnline: true },
    { id: 2, username: "Alex Thompson", isOnline: true },
    { id: 3, username: "John Doe", isOnline: false },
  ];

  return (
    <Flex h="100%" position="relative">
      <Box
        flex="1"
        display="flex"
        flexDirection="column"
        bg="gray.50"
        maxW={`calc(100% - 260px)`}
      >
        {/* Chat Header */}
        {selectedGroup ? (
          <>
            <Flex
              px={6}
              py={4}
              bg="white"
              borderBottom="1px solid"
              borderColor="gray.200"
              align="center"
              boxShadow="sm"
            >
              <Icon
                as={FiMessageCircle}
                fontSize="24px"
                color="blue.500"
                mr={3}
              />
              <Box flex="1">
                <Text fontSize="lg" fontWeight="bold" color="gray.800">
                  {selectedGroup.name}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  General Discussion
                </Text>
              </Box>
              <Icon
                as={FiInfo}
                fontSize="20px"
                color="gray.400"
                cursor="pointer"
                _hover={{ color: "blue.500" }}
              />
            </Flex>

            {/* Messages Area */}
            <VStack
              flex="1"
              overflowY="auto"
              spacing={4}
              align="stretch"
              px={6}
              py={4}
              position="relative"
              sx={{
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  width: "10px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "gray.200",
                  borderRadius: "24px",
                },
              }}
            >
              {message.map((msg) => (
                <Box
                  key={msg._id}
                  alignSelf={
                    msg.sender._id === currentUser._id
                      ? "flex-start"
                      : "flex-end"
                  }
                  maxW="70%"
                >
                  <Flex direction="column" gap={1}>
                    <Flex
                      align="center"
                      mb={1}
                      justifyContent={
                        msg.sender._id === currentUser._id
                          ? "flex-start"
                          : "flex-end"
                      }
                      gap={2}
                    >
                      {msg.sender._id === currentUser._id ? (
                        <>
                          <Avatar size="xs" name={msg.sender.username} />
                          <Text fontSize="xs" color="gray.500">
                            You • {formatTime(msg.createdAt)}
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text fontSize="xs" color="gray.500">
                            {msg.sender.username} • {formatTime(msg.createdAt)}
                          </Text>
                          <Avatar size="xs" name={msg.sender.username} />
                        </>
                      )}
                    </Flex>

                    <Box
                      bg={
                        msg.sender._id === currentUser._id
                          ? "blue.500"
                          : "white"
                      }
                      color={
                        msg.sender._id === currentUser._id
                          ? "white"
                          : "gray.800"
                      }
                      p={3}
                      borderRadius="lg"
                      boxShadow="sm"
                    >
                      <Text>{msg.content}</Text>
                    </Box>
                  </Flex>
                </Box>
              ))}
              <Box ref={messagesEndRef} />
            </VStack>

            {/* Message Input */}
            <Box
              p={4}
              bg="white"
              borderTop="1px solid"
              borderColor="gray.200"
              position="relative"
              zIndex="1"
            >
              <InputGroup size="lg">
                <Input
                  placeholder="Type your message..."
                  pr="4.5rem"
                  bg="gray.50"
                  border="none"
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  _focus={{
                    boxShadow: "none",
                    bg: "gray.100",
                  }}
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    colorScheme="blue"
                    borderRadius="full"
                    onClick={sendMessage}
                    _hover={{
                      transform: "translateY(-1px)",
                    }}
                    transition="all 0.2s"
                  >
                    <Icon as={FiSend} />
                  </Button>
                </InputRightElement>
              </InputGroup>
            </Box>
          </>
        ) : (
          <>
            <Flex
              h="100%"
              align="center"
              justify="center"
              p={8}
              textAlign="center"
              direction="column"
            >
              <Icon
                as={FiMessageCircle}
                fontSize="64px"
                color="gray.300"
                mb={4}
              />
              <Text fontSize="2xl" fontWeight="medium" color="gray.500" mb={2}>
                Welcome to the Chat
              </Text>
              <Text color="gray.500" mb={2}>
                Select a group from the sidebar to start chatting.
              </Text>
            </Flex>
          </>
        )}
      </Box>

      {/* UsersList with fixed width */}
      <Box
        width="260px"
        position="sticky"
        right={0}
        top={0}
        height="100%"
        flexShrink={0}
      >
        {selectedGroup && <UsersList users={connectedUsers} />}
      </Box>
    </Flex>
  );
};

export default ChatArea;
