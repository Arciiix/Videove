import express from "express";
import { Server, Socket } from "socket.io";
import config from "./config";
import { initDatabase } from "./db";
import logger from "./utils/logger";
import projectRouter from "./routes/project";
import loggingMiddleware from "./middlewares/loggingMiddleware";

const app = express();
app.use(express.json());
app.use(loggingMiddleware);
app.use("/projects", projectRouter);

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

async function main() {
  await initDatabase();
}
main();