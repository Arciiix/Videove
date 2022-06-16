import { atom } from "recoil";

const isEditingDashboardState = atom<boolean>({
  key: "is-editing-dashboard",
  default: false,
});

export default isEditingDashboardState;
