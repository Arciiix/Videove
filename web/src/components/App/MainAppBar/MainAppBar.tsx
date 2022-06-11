import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import HorizontalDivider from "../../HorizontalDivider/HorizontalDivider";
import Indicator from "../../Indicator/Indicator";
import Logo from "../../Logo/Logo";

import styles from "./MainAppBar.module.css";

interface IMainAppBarProps {
  projectName: string;
  isOnAir: boolean;
  isRecording: boolean;
  isStreaming: boolean;
}

function MainAppBar({
  projectName,
  isOnAir,
  isRecording,
  isStreaming,
}: IMainAppBarProps) {
  return (
    <AppBar position="static">
      <Toolbar>
        <Container
          maxWidth={false}
          classes={{ root: styles.container }}
          className={styles.container}
        >
          <Box
            p={1}
            display="flex"
            flexDirection={"row"}
            alignItems={"center"}
            gap={2}
          >
            <Logo height="30px" />
            <Typography variant="h5">{projectName}</Typography>
          </Box>
          <Box display="flex">
            <Indicator status={isOnAir} description="ON AIR" />
            <HorizontalDivider />
            <Indicator status={isRecording} description="RECORDING" />
            <HorizontalDivider />
            <Indicator status={isStreaming} description="STREAMING" />
          </Box>
        </Container>
      </Toolbar>
    </AppBar>
  );
}

export default MainAppBar;
