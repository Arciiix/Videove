import { atom } from "recoil";

const layoutState = atom<ReactGridLayout.Layout[]>({
  key: "layout-state",
  default: [],
});

export default layoutState;
