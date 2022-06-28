import OBSWebSocket from "obs-websocket-js";
import { Socket } from "socket.io-client";
import { IMedia } from "../types/Media.type";
import { IShot } from "../types/Shot.type";
import { IMediaChange } from "../types/Socket.type";

async function handleMediaChange(
  obs: OBSWebSocket,
  currMedia: IMedia,
  io: Socket | null,
  nextShotDate?: Date
): Promise<void> {
  await obs.call("SetCurrentProgramScene", {
    sceneName: currMedia.number.toString(),
  });

  if (io) {
    io.emit("mediaChange", {
      media: currMedia,
      nextShotDate,
    } as IMediaChange);
  }
}
export default handleMediaChange;
