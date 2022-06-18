import { atom } from "recoil";
import { IProject } from "../types/Project.type";

const projectsState = atom<IProject[]>({
  key: "projects",
  default: [],
});

export default projectsState;
