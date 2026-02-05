const express = require("express");
const dotenv = require("dotenv"); // load .env variables in process.env
const cors = require("cors"); // allows connection b/w frontend and backend
const mongoose = require("mongoose"); // data base connection
const http = require("http"); // more flexibility with socket.io
const socket = require("socket.io"); // socket.io library
const socketIo = require("./socket"); // socket handling file

// load env variables
dotenv.config();

// import routers
const userRouter = require("./routers/userRouter");
const groupRouter = require("./routers/groupRouter");
const messageRouter = require("./routers/messageRouter");

// express + http server
const app = express();
const server = http.createServer(app);

// socket.io setup
// initialize new instance of socket.io by passing http server object
// socket.io server will listen to same port as http server
// configure cors for socket.io
const io = socket(server, {
  cors: {
    origin: ["http://localhost:5173", "https://halo-connect.netlify.app"], // frontend urls
    methods: ["GET", "POST"],
    credentials: true,
  },
});

//middlewares
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://halo-connect.netlify.app"],
    credentials: true,
  })
);

//connect to database
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((e) => {
    console.log("MongoDB connection failure:", e.message);
  });

// call socket.js file
socketIo(io);

// routes
app.use("/api/users", userRouter);
app.use("/api/groups", groupRouter);
app.use("/api/messages", messageRouter);

// start server
// start HTTP + Express + Socket.IO together.
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
