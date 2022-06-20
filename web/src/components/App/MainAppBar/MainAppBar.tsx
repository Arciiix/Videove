import { Add, Edit } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useRecoilState, useRecoilValue } from "recoil";
import OBSContext from "../../../context/OBS.context";
import createScenes from "../../../helpers/createScenes";
import { saveSmallLayout, saveLayout } from "../../../helpers/saveLayout";
import isEditingDashboardState from "../../../recoil/is-editing-dashboard";
import isSmallLayoutState from "../../../recoil/is-small-layout";
import layoutState from "../../../recoil/layout";
import { IMedia } from "../../../types/Media.type";
import useConfirm from "../../ConfirmationDialog/useConfirm";
import HorizontalDivider from "../../HorizontalDivider/HorizontalDivider";
import Indicator from "../../Indicator/Indicator";
import Logo from "../../Logo/Logo";

import styles from "./MainAppBar.module.css";

interface IMainAppBarProps {
  projectId: string;
  projectName: string;
  media: IMedia[];
  isOnAir: boolean;
  isRecording: boolean;
  isStreaming: boolean;
}

function MainAppBar({
  projectId,
  projectName,
  media,
  isOnAir,
  isRecording,
  isStreaming,
}: IMainAppBarProps) {
  const confirm = useConfirm();
  const navigate = useNavigate();

  const [isEditingDashboard, setIsEditingDashboard] = useRecoilState(
    isEditingDashboardState
  );
  const layout = useRecoilValue(layoutState);
  const [isSmallLayout, setIsSmallLayout] = useRecoilState(isSmallLayoutState);

  const obs = useContext(OBSContext);

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

  const handleSmallLayoutSwitchChange = async (
    val: React.ChangeEvent<HTMLInputElement>
  ) => {
    const confirmed = await confirm(
      `Are you sure you want to ${
        val.target.checked
          ? "make the previews small"
          : "turn off the small previews"
      }?"`
    );

    if (!confirmed) {
      return;
    }

    await saveSmallLayout(projectId, !val.target.checked);
    setIsSmallLayout(!val.target.checked);
  };

  const handleEdit = () => {
    return navigate(`/editProject/${projectId}`);
  };

  const handleAddScenesClick = async () => {
    const confirmed = await confirm(
      `Are you sure you want to create corresponding scenes in the OBS?"`
    );

    if (!confirmed) {
      return;
    }

    await createScenes(obs, projectName, projectId, media);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Container
          maxWidth={false}
          classes={{ root: `${styles.container} mainAppBar` }}
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
            <IconButton onClick={handleEdit}>
              <Edit />
            </IconButton>
          </Box>
          <Box display="flex" alignItems={"center"}>
            <Box display="flex" flexDirection={"row"}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isEditingDashboard}
                    onChange={handleEditingSwitchChange}
                    inputProps={{ "aria-label": "controlled" }}
                  />
                }
                label={isEditingDashboard ? "Turn off to save" : "Edit layout"}
                labelPlacement="bottom"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={isSmallLayout}
                    onChange={handleSmallLayoutSwitchChange}
                    inputProps={{ "aria-label": "controlled" }}
                  />
                }
                label={"Smaller previews"}
                labelPlacement="bottom"
              />
            </Box>
            <Box display="flex" flexDirection={{ md: "row", xs: "column" }}>
              <Indicator status={isOnAir} description="ON AIR" />
              <HorizontalDivider />
              <Indicator status={isRecording} description="RECORDING" />
              <HorizontalDivider />
              <Indicator status={isStreaming} description="STREAMING" />
              <HorizontalDivider />
              <IconButton
                aria-label="Add scenes to OBS"
                onClick={handleAddScenesClick}
              >
                <Add />
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Toolbar>
    </AppBar>
  );
}

export default MainAppBar;
