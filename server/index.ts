import express from "express";
import { Server, Socket } from "socket.io";
import config from "./config";
import { initDatabase } from "./db";
import logger from "./utils/logger";
import projectRouter from "./routes/project";
import loggingMiddleware from "./middlewares/loggingMiddleware";
import cdnRouter from "./routes/cdn";
import testingRouter from "./routes/testing";
import { IPlayPayload, ISeekPayload } from "./types/SocketTypes";

const app = express();
app.use(express.json());
app.use(loggingMiddleware);

const api = express.Router();
app.use("/api", api);
api.use("/projects", projectRouter);
api.use("/cdn", cdnRouter);
api.use("/testing", testingRouter); //DEV

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

  socket.on("play", (payload: IPlayPayload) => {
    logger.info(`[EVENT] play: ${JSON.stringify(payload)}`);
    io.emit("play", {
      play: payload.play,
      delay: payload.delay ?? 0,
      startAt: new Date(payload.startAt),
    } as IPlayPayload);
  });

  socket.on("seek", (payload: ISeekPayload) => {
    logger.info(`[EVENT] seek: ${JSON.stringify(payload)}`);
    io.emit("seek", {
      delay: payload.delay,
    } as ISeekPayload);
  });
});

async function main() {
  await initDatabase();
}
main();

export { io };
