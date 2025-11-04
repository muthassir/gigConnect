const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("socket connected", socket.id);

    socket.on("join", ({ room }) => {
      socket.join(room);
      console.log(`${socket.id} joined ${room}`);
    });

    socket.on("leave", ({ room }) => {
      socket.leave(room);
    });

    socket.on("message", (msg) => {
      io.to(msg.room).emit("message", {
        ...msg,
        createdAt: new Date().toISOString()
      });
    });

    socket.on("disconnect", (reason) => {
      console.log("socket disconnected", socket.id, "reason:", reason);
    });
  });
};

module.exports = socketHandler;