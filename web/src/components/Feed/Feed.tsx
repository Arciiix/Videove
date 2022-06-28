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
import { useRecoilState, useRecoilValue } from "recoil";
import OBSContext from "../../context/OBS.context";
import handleMediaChange from "../../helpers/handleMediaChange";
import isEditingShotsState from "../../recoil/is-editing-shots";
import getState from "../../utils/getState";
import currPositionState from "../../recoil/curr-position";
import totalLengthSecondsState from "../../recoil/total-length-seconds";
import addShotToTimeline from "../../helpers/addShotToTimeline";
import currentShotsState from "../../recoil/current-shots";
import { saveShots } from "../../helpers/shots";
import { IAddedShot } from "../../types/Shot.type";
import socketIoState from "../../recoil/socketio";
import { Socket } from "socket.io-client";
import getNextShotTime from "../../helpers/getNextShotTime";

interface IFeedProps {
  data: IMedia;
  width: string;
  height: string;
  projectId: string;
  hideIndicator?: boolean;
}
function Feed({
  data,
  width,
  height,
  projectId,
  hideIndicator = false,
}: IFeedProps) {
  const socketio = useRecoilValue(socketIoState);
  const [media, setMedia] = useState(data);
  const [askingForScreenShare, setAskingForScreenShare] = useState(false);
  const obs = useContext(OBSContext);
  const currentActiveMedia = useRecoilValue(currentActiveMediaState);
  const [playerKey, setPlayerKey] = useState(
    `player${data.number}` + new Date()
  );

  const isEditingShots = useRecoilValue(isEditingShotsState);
  const [currPosition, setCurrPosition] = useRecoilState(currPositionState);
  const [totalLengthSeconds, setTotalLengthSeconds] = useRecoilState(
    totalLengthSecondsState
  );
  const [shots, setShots] = useRecoilState(currentShotsState);

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

  const handleRightClick = async () => {
    setPlayerKey(`player${data.number}` + new Date());
    await askForScreenShare();
    setPlayerKey(`player${data.number}` + new Date());
  };

  const handleAddShotToTimeline = async (shot: IAddedShot) => {
    let currPosition: number = await getState(setCurrPosition);
    let totalLengthSeconds = await getState(setTotalLengthSeconds);

    await addShotToTimeline(shot, currPosition, totalLengthSeconds, setShots);

    console.log("Save shots");
    const shots = await getState(setShots);
    await saveShots(shots, projectId as string);
  };

  const switchMedia = async () => {
    if (currentActiveMedia === data.number.toString()) {
      return;
    }

    if (isEditingShots) {
      handleAddShotToTimeline({
        mediaNumber: data.number,
        color: data.color || "#808080",
        name: "",
      });
    }
    handleMediaChange(
      obs,
      data,
      socketio as Socket,
      getNextShotTime(await getState(setCurrPosition), await getState(setShots))
    );
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
        handleRightClick();
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
          <Player key={playerKey} width={width} height={height} media={media} />
        )}
      </Box>
      <MediaNumber number={media.number} color={media.color ?? "#808080"} />
      <span className={styles.name}>{media.name}</span>
    </div>
  );
}
export default Feed;
