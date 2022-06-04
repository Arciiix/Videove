import { Box } from "@mui/system";
import styles from "./OBSStatus.module.css";

function OBSStatus({ connected }: { connected: boolean }) {
  return (
    <Box display={"flex"} justifyContent="center" alignItems={"center"}>
      <div
        className={styles.indicator}
        style={{ backgroundColor: connected ? "#eb4034" : "#5e5e5e" }}
      ></div>
      {connected ? "Connected" : "Disconnected"}
    </Box>
  );
}

export default OBSStatus;
