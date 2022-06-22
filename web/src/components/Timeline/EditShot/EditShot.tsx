import { Delete } from "@mui/icons-material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import { IShot } from "../../../types/Shot.type";

import styles from "./EditShot.module.css";

interface IEditShotProps {
  shot: IShot | null;
  shotIndex: number;
  handleClose: () => void;
  handleSave: (shot: IShot) => void | Promise<void>;
  handleDelete: (shot: IShot) => void | Promise<void>;
}

function EditShot({
  shot,
  shotIndex,
  handleClose,
  handleSave,
  handleDelete,
}: IEditShotProps) {
  const [shotName, setShotName] = useState("");

  useEffect(() => {
    if (shot) setShotName(shot.name);
  }, [shot]);
  return (
    <Dialog open={!!shot} onClose={handleClose}>
      <DialogTitle>
        {shot
          ? `Edit shot ${shotIndex} ${
              shot?.mediaNumber ? "of media " + shot.mediaNumber : ""
            }`
          : `Please wait...`}
      </DialogTitle>
      <DialogContent>
        <TextField
          value={shotName}
          onChange={(e) => setShotName(e.target.value)}
          autoFocus
          margin="dense"
          label="Name"
          fullWidth
          variant="standard"
        />
        <div className={styles.spacing}></div>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => handleDelete(shot as IShot)}
        >
          <Delete />
          Delete
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={() =>
            handleSave({
              ...(shot as IShot),
              ...{
                name: shotName,
              },
            })
          }
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditShot;
