import {
  LiveTv,
  PlayArrow,
  SkipNext,
  SkipPrevious,
  Stop,
  ZoomIn,
  ZoomOut,
} from "@mui/icons-material";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IShot } from "../../types/Shot.type";
import { secondsTomm_ss_ms } from "../../utils/timeFormatter";
import Shot from "./Shot/Shot";
import styles from "./Timeline.module.css";

interface ITimelineProps {
  totalLengthSeconds: number;
}

function Timeline({ totalLengthSeconds }: ITimelineProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currPosition, setCurrPosition] = useState(0);

  // How many pixels per second of the timeline
  const [currentSecondsToWidthMultiplier, setCurrentSecondsToWidthMultiplier] =
    useState(100);

  const [shots, setShots] = useState<IShot[]>([
    {
      mediaNumber: 1,
      color: "#a11211",
      name: "test",
      delaySeconds: 0,
      durationSeconds: 2,
    },
    {
      mediaNumber: 2,
      color: "#00ff22",
      name: "",
      delaySeconds: 2,
      durationSeconds: 10,
    },
  ]);

  const renderShots = useMemo(() => {
    return shots.map((shot, index) => {
      return (
        <Shot
          key={index + "_" + shot.mediaNumber}
          shot={shot}
          currentSecondsToWidthMultiplier={currentSecondsToWidthMultiplier}
        />
      );
    });
  }, [shots, currentSecondsToWidthMultiplier]);

  const handlePlaybackStatusChange = async () => {
    //DEV
    //TODO: An event
    setIsPlaying((isPlaying) => !isPlaying);
  };

  const handleZoomIn = (power?: number) => {
    setCurrentSecondsToWidthMultiplier(
      (currentSecondsToWidthMultiplier) =>
        currentSecondsToWidthMultiplier + 10 * (power ?? 1)
    );
  };

  const handleZoomOut = (power?: number) => {
    setCurrentSecondsToWidthMultiplier(
      (currentSecondsToWidthMultiplier) =>
        currentSecondsToWidthMultiplier - 10 * (power ?? 1)
    );
  };

  const handleBackward = useCallback(() => {
    console.log(isPlaying);
    if (isPlaying) return; //Only if not playing

    //TODO: Emit an event so that videos can seek to the new position
    setCurrPosition((currPosition) => {
      if (currPosition - 1 < 0) return 0; //Only if not at start
      return currPosition - 1;
    });
  }, [isPlaying, currPosition]);

  const handleForward = useCallback(() => {
    if (isPlaying) return; //Only if not playing
    if (currPosition + 1 > totalLengthSeconds) return; //Only if not at end

    //TODO: Emit an event so that videos can seek to the new position
    setCurrPosition((currPosition) => {
      if (currPosition + 1 > totalLengthSeconds) return totalLengthSeconds;
      return currPosition + 1;
    });
  }, [isPlaying, currPosition]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isPlaying) {
      let prevDate = new Date();
      interval = setInterval(() => {
        // console.log(
        //   "INTERVAL",
        //   (new Date().getTime() - prevDate.getTime()) / 1000
        // );
        const delay = (new Date().getTime() - prevDate.getTime()) / 1000;
        setCurrPosition((currPosition) => currPosition + delay);
        prevDate = new Date();
      });
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, currentSecondsToWidthMultiplier]);

  useEffect(() => {
    //Detect ctrl + scroll
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.ctrlKey) {
        if (e.deltaY > 0) {
          handleZoomIn();
        } else {
          handleZoomOut();
        }
      }
    };
    const handleKeydown = (e: KeyboardEvent) => {
      console.log(`Keydown`, e.key);
      switch (e.key) {
        case "=":
          handleZoomIn(0.2);
          break;
        case "-":
          handleZoomOut(0.2);
          break;
        case "ArrowLeft": //TODO: Fix it, sometimes doesn't work
          handleBackward();
          break;
        case "ArrowRight":
          handleForward();
          break;
        case " ": //Space
          handlePlaybackStatusChange();
          break;
        default:
          return;
      }
    };

    document.addEventListener("wheel", handleWheel);
    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("wheel", handleWheel);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [isPlaying]);

  return (
    <Box className={`${styles.wrapper} timeline`}>
      <Box className={styles.timelineWrapper}>
        <LiveTv classes={{ root: styles.icon }} />
        <div className={styles.cutLine}></div>
        <div
          className={styles.timeline}
          style={{
            transform: `translateX(-${
              currPosition * currentSecondsToWidthMultiplier
            }px)`,
          }}
        >
          {renderShots}
        </div>
      </Box>
      <Box className={styles.playbackStatus}>
        <IconButton onClick={() => handleZoomOut()}>
          <ZoomOut />
        </IconButton>
        <IconButton onClick={handleBackward}>
          <SkipPrevious />
        </IconButton>
        <IconButton onClick={handlePlaybackStatusChange}>
          {isPlaying ? <Stop /> : <PlayArrow />}
        </IconButton>
        <div className={styles.playbackStatusText}>
          {secondsTomm_ss_ms(currPosition)} /{" "}
          {secondsTomm_ss_ms(totalLengthSeconds)}
        </div>
        <div className={styles.nextCut}>/0</div>
        <IconButton onClick={handleForward}>
          <SkipNext />
        </IconButton>
        <IconButton onClick={() => handleZoomIn()}>
          <ZoomIn />
        </IconButton>
      </Box>
    </Box>
  );
}

export default Timeline;
