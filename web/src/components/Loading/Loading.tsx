import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

function Loading({ open }: { open: boolean }) {
  return (
    <Backdrop
      sx={{
        color: "#fff",
        zIndex: (theme: { zIndex: { drawer: number } }) =>
          theme.zIndex.drawer + 1,
      }}
      open={open}
      onClick={() => {}}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}
export default Loading;
