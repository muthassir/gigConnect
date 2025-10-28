const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));


app.use("/api/auth", require("./routes/authRoute.js"));
app.use("/api/users", require("./routes/usersRoute.js"));
app.use("/api/reviews", require("./routes/reviewRoute.js"));
app.use("/api/payments", require("./routes/paymentRoute.js"));


const server = http.createServer(app);


const io = new Server(server, {
  cors: { origin: "*" }, 
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
    io.to(msg.room).emit("message", msg);

   
  });

  socket.on("disconnect", () => {
    console.log("socket disconnected", socket.id);
  });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started at port ${PORT}`));
