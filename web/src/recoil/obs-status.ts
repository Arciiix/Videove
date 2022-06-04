import { atom } from "recoil";

const obsStatusState = atom<boolean>({
  key: "obs-status",
  default: false,
});

export default obsStatusState;
