import express from "express";
import { Server, Socket } from "socket.io";
import config from "./config";
import logger from "./logger";

const app = express();

const server = app.listen(config.PORT, () => {
  logger.info(`App has started on port ${config.PORT}`);
});
const io = new Server(server, {
  cors: {
    origin: ["https://admin.socket.io"],
  },
});

io.on("connection", (socket: Socket) => {
  logger.info(`New socket with id ${socket.id} has connected!`);

  socket.on("disconnect", (reason) => {
    logger.info(`Socket ${socket.id} has disconnected - ${reason}`);
  });
});
