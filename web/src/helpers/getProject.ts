import axios, { AxiosError } from "axios";
import { IProject } from "../types/Project.type";

async function getProject(
  id: string
): Promise<{ project?: IProject; error?: AxiosError | unknown }> {
  try {
    const projectRequest = await axios.get(`/api/projects/${id}`);
    const projectResponse = projectRequest.data;
    return { project: projectResponse.project as IProject };
  } catch (err: AxiosError | unknown) {
    console.error(err);
    return { error: err };
  }
}

export default getProject;
