import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useRecoilState, useRecoilValue } from "recoil";
import saveLayout from "../../../helpers/saveLayout";
import isEditingDashboardState from "../../../recoil/is-editing-dashboard";
import layoutState from "../../../recoil/layout";
import useConfirm from "../../ConfirmationDialog/useConfirm";
import HorizontalDivider from "../../HorizontalDivider/HorizontalDivider";
import Indicator from "../../Indicator/Indicator";
import Logo from "../../Logo/Logo";

import styles from "./MainAppBar.module.css";

interface IMainAppBarProps {
  projectId: string;
  projectName: string;
  isOnAir: boolean;
  isRecording: boolean;
  isStreaming: boolean;
}

function MainAppBar({
  projectId,
  projectName,
  isOnAir,
  isRecording,
  isStreaming,
}: IMainAppBarProps) {
  const confirm = useConfirm();

  const [isEditingDashboard, setIsEditingDashboard] = useRecoilState(
    isEditingDashboardState
  );
  const layout = useRecoilValue(layoutState);

  const handleEditingSwitchChange = async (
    val: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsEditingDashboard(val.target.checked);
    if (!val.target.checked) {
      const confirmed = await confirm(
        "Are you sure you want to save this layout?"
      );

      if (!confirmed) return;
      await saveLayout(projectId, layout);
    }
  };

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
          <Box display="flex" alignItems={"center"}>
            <Box display="flex" flexDirection={"column"}>
              <FormControlLabel
                control={
                  <Switch
                    value={isEditingDashboard}
                    onChange={handleEditingSwitchChange}
                  />
                }
                label={isEditingDashboard ? "Turn off to save" : "Edit layout"}
                labelPlacement="bottom"
              />
            </Box>
            <Box display="flex" flexDirection={{ md: "row", xs: "column" }}>
              <Indicator status={isOnAir} description="ON AIR" />
              <HorizontalDivider />
              <Indicator status={isRecording} description="RECORDING" />
              <HorizontalDivider />
              <Indicator status={isStreaming} description="STREAMING" />
            </Box>
          </Box>
        </Container>
      </Toolbar>
    </AppBar>
  );
}

export default MainAppBar;
