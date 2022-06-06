import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";

interface IConfirmationDialog {
  open: boolean;
  description: string;
  onConfirm: () => void;
  onClose: () => void;
}

function ConfirmationDialog({
  open,
  description,
  onConfirm,
  onClose,
}: IConfirmationDialog) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{description}</DialogTitle>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm}>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
}
export default ConfirmationDialog;
