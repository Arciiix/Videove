import { Socket } from "socket.io-client";
import { Media, MediaTypes } from "../types/Media.type";
import { IMediaChange } from "../types/Socket.type";

function emitSceneChanged(newSceneNumber: number, io: Socket): void {
  //TODO: Fix it - it overrides the current "scene changed" event, so that removes the appropriate media color
  //   io.emit("mediaChange", {
  //     media: {
  //       number: newSceneNumber,
  //       type: MediaTypes.CUSTOM, //Doesn't matter, just switch the scene
  //       media: new Media(),
  //     },
  //   } as IMediaChange);
}

export default emitSceneChanged;
