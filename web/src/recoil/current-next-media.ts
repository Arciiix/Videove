import { atom } from "recoil";

const currentNextMediaState = atom<number | null>({
  key: "current-next-media",
  default: null,
});

export default currentNextMediaState;
