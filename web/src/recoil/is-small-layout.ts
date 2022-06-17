import { atom } from "recoil";

const isSmallLayoutState = atom<boolean>({
  key: "is-small-layout",
  default: false,
});

export default isSmallLayoutState;
