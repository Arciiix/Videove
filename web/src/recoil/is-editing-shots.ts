import { atom } from "recoil";

const isEditingShotsState = atom<boolean>({
  key: "is-editing-shots",
  default: false,
});

export default isEditingShotsState;
