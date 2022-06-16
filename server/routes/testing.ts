import express, { Request, Response } from "express";
import { io } from "..";

const testingRouter = express.Router();

testingRouter.get("/samplePlay", async (req: Request, res: Response) => {
  io.emit("play", {
    play: true,
    delay: 5000,
    startAt: new Date(new Date().getTime() + 1000),
  });
  res.sendStatus(200);
});
testingRouter.get("/stop", async (req: Request, res: Response) => {
  io.emit("play", {
    play: false,
  });
  res.sendStatus(200);
});

export default testingRouter;
