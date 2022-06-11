import Box from "@mui/material/Box";

import styles from "./Indicator.module.css";

interface IIndicatorProps {
  status: boolean;
  description: string;
}
function Indicator({ status, description }: IIndicatorProps) {
  return (
    <Box className={styles.stateWrapper}>
      <div
        className={styles.indicator}
        style={{ backgroundColor: status ? "#d10000" : "gray" }}
      ></div>
      <span
        style={{
          color: status ? "white" : "gray",
          fontWeight: status ? "bold" : "normal",
        }}
      >
        {description}
      </span>
    </Box>
  );
}
export default Indicator;
