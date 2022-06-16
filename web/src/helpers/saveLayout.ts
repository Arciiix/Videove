import axios from "axios";
import { toast } from "react-toastify";

async function saveLayout(
  projectId: string,
  layout: ReactGridLayout.Layout[]
): Promise<void> {
  try {
    await axios.patch("/api/projects/update", {
      projectId,
      project: {
        layout,
      },
    });
  } catch (error) {
    console.error(error);
    await toast.error("Error saving layout");
  }
}

export default saveLayout;
