import { atom } from "recoil";
import { io, Socket } from "socket.io-client";

const socketIoState = atom<Socket | null>({
  key: "socketio-client",
  default: null,
  dangerouslyAllowMutability: true,
});

export default socketIoState;
