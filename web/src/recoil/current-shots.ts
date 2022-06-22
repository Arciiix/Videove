import { atom } from "recoil";
import { IShot } from "../types/Shot.type";

const currentShotsState = atom<IShot[]>({
  key: "shots",
  default: [],
});

export default currentShotsState;
