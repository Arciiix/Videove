import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { io, Socket } from "socket.io-client";
import socketIoState from "../../recoil/socketio";
import { IMedia } from "../../types/Media.type";
import { IMediaChange } from "../../types/Socket.type";
import getFontColor from "../../utils/getFontColor";
import styles from "./CurrentMedia.module.css";

function CurrentMedia() {
  const [timeUntil, setTimeUntil] = useState<number>(0);
  const [currMedia, setCurrMedia] = useState<IMedia | null>(null);
  const [socket, setSocket] = useRecoilState(socketIoState);

  useEffect(() => {
    //Create the socket.io connection
    let socketIo: Socket | null = socket;
    if (!socketIo) {
      socketIo = io();
      setSocket(socketIo);
    }
    socketIo.on("mediaChange", (data: IMediaChange) => {
      if (data.nextShotDate) {
        setTimeUntil(
          (new Date(data.nextShotDate).getTime() - new Date().getTime()) /
            1000 +
            1
        );
      }
      setCurrMedia(data.media);
    });
  }, []);

  useEffect(() => {
    let interval = setInterval(() => {
      setTimeUntil((prev) => {
        let newVal = prev - 0.2;
        return newVal < 0 ? 0 : newVal;
      });
    }, 200);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.mediaNumber} ${styles.center}`}
        style={{
          backgroundColor: currMedia?.color ?? "#808080",
          color: getFontColor(currMedia?.color ?? "#808080"),
        }}
      >
        {currMedia?.number ?? "-"}
      </div>
      <div
        className={`${styles.timeUntil} ${styles.center}`}
        style={{
          color:
            timeUntil <= 1 && timeUntil > 0 ? "hsl(340, 94%, 49%)" : "white",
        }}
      >
        {Math.floor(timeUntil)}
      </div>
    </div>
  );
}

export default CurrentMedia;
