import { atom } from "recoil";

const isOnAirState = atom<boolean>({
  key: "on-air",
  default: false,
});

export default isOnAirState;
