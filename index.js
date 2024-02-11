import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import AdminsRoute from "./routes/AdminsRoute.js";
import VotersRoute from "./routes/VotersRoute.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { handleConnection } from "./controllers/ConnectionController.js";
dotenv.config();
const port = process.env.PORT || 5000;
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    credentials: true,
    origin: process.env.ORIGIN,
    methods: ["GET", "POST"],
  },
});
app.use(
  cors({
    credentials: true,
    origin: process.env.ORIGIN,
  })
);
app.use(
  session({
    secret: "rahasia",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: "auto",
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(AdminsRoute);
app.use(VotersRoute);
io.on("connection", (socket) => {
  handleConnection(io, socket);
});
server.listen(port, () => {
  console.log("Server Sedang Berjalan di Port : " + port);
});
