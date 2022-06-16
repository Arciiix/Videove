import { atom } from "recoil";

const currentActiveMediaState = atom<string>({
  key: "current-active-media",
  default: "",
});

export default currentActiveMediaState;
