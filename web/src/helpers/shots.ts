import axios from "axios";
import { toast } from "react-toastify";
import { IShot } from "../types/Shot.type";

async function getShots(projectId: string): Promise<IShot[] | null> {
  try {
    const response = await axios.get(`/api/shots/${projectId}`);
    let shots = response.data?.shots;
    if (!shots) shots = [];
    return shots.map((e: any) => e as IShot) || [];
  } catch (err) {
    console.error(err);
    toast.error("Error while getting the shots");
    return null;
  }
}
async function saveShots(shots: IShot[], projectId: string): Promise<void> {
  try {
    const response = await axios.put(`/api/shots/${projectId}`, {
      shots: shots,
    });
  } catch (err) {
    console.error(err);
    toast.error("Error while saving the shots");
  }
}
async function editShot(
  shotIndex: number,
  newShot: IShot,
  projectId: string
): Promise<void> {
  try {
    const response = await axios.put(`/api/shots/${projectId}/${shotIndex}`, {
      shot: newShot,
    });
  } catch (err) {
    console.error(err);
    toast.error("Error while saving the shot");
  }
}

async function deleteShot(shotIndex: number, projectId: string): Promise<void> {
  try {
    const response = await axios.delete(`/api/shots/${projectId}/${shotIndex}`);
  } catch (err) {
    console.error(err);
    toast.error("Error while deleting the shot");
  }
}

async function deleteAllShots(projectId: string): Promise<void> {
  try {
    const response = await axios.delete(`/api/shots/${projectId}`);
  } catch (err) {
    console.error(err);
    toast.error("Error while deleting all the shots");
  }
}

export { getShots, saveShots, editShot, deleteShot, deleteAllShots };
