const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();

// Helmet security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "ws:", "wss:", "blob:"],
      frameSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());


// db connection
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// routes
app.use("/api/auth", require("./routes/authRoute.js"));
app.use("/api/users", require("./routes/usersRoute.js"));
app.use("/api/gigs", require("./routes/gigRoutes.js"))
app.use("/api/reviews", require("./routes/reviewRoute.js"));
app.use("/api/payments", require("./routes/paymentRoute.js"));
app.use("/api/messages", require("./routes/messageRoutes.js"));



const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling'] 
});

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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started at port ${PORT}`));