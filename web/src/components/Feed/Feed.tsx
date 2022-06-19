import Box from "@mui/material/Box";
import { useContext, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import {
  ColorMedia,
  CustomMedia,
  IMedia,
  MediaTypes,
} from "../../types/Media.type";
import Player from "./Player/Player";

import styles from "./Feed.module.css";
import Paper from "@mui/material/Paper";
import MediaNumber from "./MediaNumber/MediaNumber";
import currentActiveMediaState from "../../recoil/current-active-media";
import { useRecoilValue } from "recoil";
import OBSContext from "../../context/OBS.context";

interface IFeedProps {
  data: IMedia;
  width: string;
  height: string;
  hideIndicator?: boolean;
}
function Feed({ data, width, height, hideIndicator = false }: IFeedProps) {
  const [media, setMedia] = useState(data);
  const [askingForScreenShare, setAskingForScreenShare] = useState(false);
  const obs = useContext(OBSContext);
  const currentActiveMedia = useRecoilValue(currentActiveMediaState);

  const askForScreenShare = async () => {
    if (askingForScreenShare) return; //One request at a time
    setAskingForScreenShare(true);
    if (
      (data.type as string) === "CUSTOM" &&
      (data.media as CustomMedia).screenSharePreview
    ) {
      try {
        const stream: MediaStream =
          await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: false,
          });
        if (stream) {
          setMedia({
            ...media,
            media: {
              ...media.media,
              screenShareStreamObj: stream,
            },
          });
        }
      } catch (err) {
        console.log(`Error while getting the screen stream: `, err);
      }

      setAskingForScreenShare(false);
    }
  };

  const switchMedia = () => {
    if (currentActiveMedia === data.number.toString()) {
      return;
    }
    obs.send("SetCurrentScene", {
      "scene-name": data.number.toString(),
    });
  };

  useEffect(() => {
    setMedia(data);
  }, [data]);

  return (
    <div
      className={styles.mediaWrapper}
      onClick={switchMedia}
      onContextMenu={(e) => {
        e.preventDefault();
        askForScreenShare();
      }}
    >
      <Box
        className={`${styles.media} ${
          !hideIndicator && currentActiveMedia === media.number.toString()
            ? styles.active
            : styles.inactive
        }`}
        width={width}
        height={height}
      >
        {(media.type as string) === "COLOR" ? (
          <div
            className={styles.color}
            style={{
              backgroundColor: (media.media as ColorMedia).color,
            }}
          />
        ) : (
          <Player width={width} height={height} media={media} />
        )}
      </Box>
      <MediaNumber number={media.number} color={media.color ?? "#808080"} />
      <span className={styles.name}>{media.name}</span>
    </div>
  );
}
export default Feed;
