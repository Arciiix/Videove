import Box from "@mui/material/Box";
import { useEffect, useState, useRef } from "react";
import ReactPlayer from "react-player";
import { toast } from "react-toastify";
import { useRecoilState } from "recoil";
import { io, Socket } from "socket.io-client";
import isOnAirState from "../../../recoil/on-air";
import socketIoState from "../../../recoil/socketio";
import {
  CustomMedia,
  IMedia,
  LocalMedia,
  MediaTypes,
} from "../../../types/Media.type";
import { IPlay, ISeek } from "../../../types/Socket.type";

import styles from "./Player.module.css";
import VideoPlaceholder from "./VideoPlaceholder/VideoPlaceholder";

interface IPlayerProps {
  width: string;
  height: string;
  media: IMedia;
  fullSize?: boolean;
}

type PlayerURL = string | MediaStream;

function Player({ width, height, media, fullSize }: IPlayerProps) {
  const playerRef = useRef(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [socket, setSocket] = useRecoilState(socketIoState);
  const [isOnAir, setIsOnAir] = useRecoilState(isOnAirState);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [url, setUrl] = useState<PlayerURL>("");

  const getURL = (mediaType: MediaTypes): PlayerURL => {
    switch (mediaType as string) {
      case "LOCAL":
      case "AUDIO":
        if ((media.media as LocalMedia).path) {
          return "/api/cdn/video/" + (media.media as LocalMedia).path;
        }
        break;
      case "CUSTOM":
        if (!(media.media as CustomMedia).screenSharePreview) return "";
        if ((media.media as CustomMedia).screenShareStreamObj) {
          return (media.media as CustomMedia)
            .screenShareStreamObj as MediaStream;
        }
        break;
      //TODO: Add support for DroidCam
      default:
    }
    toast.warn(
      `Media URL/screen share object has not been set in media ${media.number}`
    );
    return "";
  };

  useEffect(() => {
    console.log(media);
    let mediaURL = getURL(media.type as MediaTypes);
    if (mediaURL) {
      setUrl(mediaURL);
    }
    if (
      (media.type as string) === "CUSTOM" &&
      (media.media as CustomMedia).screenShareStreamObj
    ) {
      setIsPlaying(true);
    }
  }, [media]);

  useEffect(() => {
    //Create the socket.io connection
    let socketIo = socket;
    if (!socketIo) {
      socketIo = io();
      setSocket(socketIo);
    }
    socketIo.on("connect", () => {
      toast.success("Connected to the socket server");
    });

    socketIo.on("disconnect", () => {
      toast.error("Disconnected from the socket server");
    });

    socketIo.on("play", (data: IPlay) => {
      console.log(data);
      if (
        data.play &&
        ((media.type as string) === "LOCAL" ||
          (media.type as string) === "AUDIO")
      ) {
        (playerRef.current as ReactPlayer | null)?.seekTo(
          (data.delay ?? 0) + ((media.media as LocalMedia).delay || 0)
        );

        console.log(
          (data.delay ?? 0) + ((media.media as LocalMedia).delay || 0)
        );
        setIsOnAir(true);

        // Start playing at the given time
        setTimeout(() => {
          setIsPlaying(true);
        }, new Date(data.startAt ?? new Date().getTime()).getTime() - new Date().getTime());
      } else {
        setIsPlaying(false);
        setIsOnAir(false);
      }
    });

    socketIo.on("seek", (data: ISeek) => {
      console.log(
        "seek",
        (data.delay ?? 0) + ((media.media as LocalMedia).delay || 0)
      );
      (playerRef.current as ReactPlayer | null)?.seekTo(
        (data.delay ?? 0) + ((media.media as LocalMedia).delay || 0)
      );
    });
  }, []);

  return (
    <Box
      className={styles.mediaWrapper}
      style={{
        width,
        height,
      }}
    >
      {isLoading && <VideoPlaceholder width={width} height={height} />}
      <ReactPlayer
        ref={playerRef}
        url={url}
        width={fullSize ? "100%" : "95%"}
        height={fullSize ? "100%" : "95%"}
        style={
          fullSize
            ? {
                margin: 0,
                padding: 0,
              }
            : {}
        }
        controls={false}
        playing={isPlaying}
        loop={false}
        muted={(media.type as string) !== "AUDIO"}
        onReady={() => {
          setIsLoading(false);
        }}
      />
    </Box>
  );
}

export default Player;
