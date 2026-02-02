const socketIo = (io) => {
  // store all online/ connected users/ sockets
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    const user = socket.handshake.auth.user;
    console.log(
      `User connected: ${user.username} with socket ID: ${socket.id}`,
    );

    // !START: Join room handler
    socket.on("joinRoom", (groupId) => {
      socket.join(groupId);
      console.log(`User ${user.username} joined room: ${groupId}`);
      onlineUsers.set(socket.id, { user, room: groupId });

      const usersInRoom = Array.from(onlineUsers.values())
        .filter((u) => u.room === groupId)
        .map((u) => u.user);
      io.in(groupId).emit("users in room", usersInRoom);

      // Notify others in the room that a new user has joined
      socket.to(groupId).emit("notification", {
        type: "USER_JOINED",
        message: `${user?.username} has joined the room.`,
      });
    });
    // !END: Join room handler

    // !START: Leave room handler
    socket.on("leaveRoom", (groupId) => {
      socket.leave(groupId);

      if (onlineUsers.has(socket.id)) {
        onlineUsers.delete(socket.id);

        // Notify others in the room that a user has left
        socket.to(groupId).emit("users left", user._id);
      }
    });
    // !END: Leave room handler

    // !START: Send message handler
    socket.on("sendMessage", ({ groupId, content }) => {
      // Broadcast the message to others in the room
      socket.to(groupId).emit("messageReceived", content);
    });
    // !END: Send message handler

    // !START: Disconnect handler
    socket.on("disconnect", () => {
      if (onlineUsers.has(socket.id)) {
        const { room } = onlineUsers.get(socket.id);
        onlineUsers.delete(socket.id);

        // Notify others in the room that a user has disconnected
        socket.to(room).emit("user left", user._id);
        onlineUsers.delete(socket.id);
      }
    });
    // !END: Disconnect handler

    // !START: Typing indicator handler
    socket.on("typing", ({ groupId, username }) => {
      socket.to(groupId).emit("typing", { username });
    });

    socket.on("stopTyping", ({ groupId, username }) => {
      socket.to(groupId).emit("stopTyping", { username });
    });
    // !END: Typing indicator handler
  });
};

module.exports = socketIo;
