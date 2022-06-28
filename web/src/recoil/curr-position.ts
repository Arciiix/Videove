import { atom } from "recoil";

const currPositionState = atom<number>({
  key: "curr-position",
  default: 0,
});

export default currPositionState;
