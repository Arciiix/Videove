import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import { IShot } from "../../../types/Shot.type";

interface IEditShotProps {
  shot: IShot | null;
  handleClose: () => void;
  handleSave: (shot: IShot) => void | Promise<void>;
}

function EditShot({ shot, handleClose, handleSave }: IEditShotProps) {
  const [shotName, setShotName] = useState("");

  useEffect(() => {
    if (shot) setShotName(shot.name);
  }, [shot]);
  return (
    <Dialog open={!!shot} onClose={handleClose}>
      <DialogTitle>
        Edit shot name {shot?.mediaNumber ? "of media " + shot.mediaNumber : ""}
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
