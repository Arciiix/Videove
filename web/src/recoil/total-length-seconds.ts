import { atom } from "recoil";

const totalLengthSecondsState = atom<number>({
  key: "total-length-seconds",
  default: 10,
});

export default totalLengthSecondsState;
