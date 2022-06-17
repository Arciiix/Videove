import axios from "axios";
import { toast } from "react-toastify";

async function saveLayout(
  projectId: string,
  layout: ReactGridLayout.Layout[]
): Promise<void> {
  try {
    await axios.patch("/api/projects/update", {
      id: projectId,
      project: {
        layout,
      },
    });
  } catch (error) {
    console.error(error);
    await toast.error("Error saving layout");
  }
}

async function saveSmallLayout(
  projectId: string,
  isSmallLayout: boolean
): Promise<void> {
  try {
    await axios.patch("/api/projects/update", {
      id: projectId,
      project: {
        isSmallLayout,
      },
    });
  } catch (error) {
    console.error(error);
    await toast.error("Error saving layout");
  }
}

export { saveLayout, saveSmallLayout };
