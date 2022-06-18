import axios from "axios";
import { IProject } from "../types/Project.type";

async function getAllProjects(): Promise<IProject[] | null> {
  try {
    const projectsReq = await axios.get("/api/projects/all?includeMedia=true");
    const projectsResponse = await projectsReq.data;
    return projectsResponse.projects as IProject[];
  } catch (err) {
    console.error(err);
    return null;
  }
}
export default getAllProjects;
