import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../Loading/Loading";
import Logo from "../../Logo/Logo";
import getProject from "../../../helpers/getProject";
import { toast } from "react-toastify";
import { IMedia } from "../../../types/Media.type";
import MediaNumber from "../../Feed/MediaNumber/MediaNumber";

import styles from "./MobileViewChooseCamera.module.css";

function MobileViewChooseCamera() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [media, setMedia] = useState<IMedia[]>([]);

  const chooseMedia = (selectedMedia: IMedia) => {
    return navigate(`${selectedMedia.number}`);
  };

  const fetchProject = async (): Promise<void> => {
    if (!projectId) return;
    const { error, project } = await getProject(projectId);
    if (error) {
      toast.error("Error while getting the project");
    } else {
      setMedia(project?.media || []);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, []);

  if (isLoading) return <Loading open />;
  return (
    <Box className={styles.container}>
      <Logo height={"200px"} full />
      <Typography variant="h4">Choose the media</Typography>
      <Box className={styles.mediaWrapper}>
        {media.map((e) => {
          return (
            <div
              className={styles.cameraNumberWrapper}
              onClick={() => chooseMedia(e)}
            >
              <MediaNumber number={e.number} color={e.color || "#808080"} />
              <span>{e.name}</span>
            </div>
          );
        })}
      </Box>
    </Box>
  );
}

export default MobileViewChooseCamera;
