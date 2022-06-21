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
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import ActiveShotContext from "../../context/ActiveShot.context";
import OBSContext from "../../context/OBS.context";
import { IShot } from "../../types/Shot.type";
import getClosestElement from "../../utils/getClosestElement";
import { secondsTomm_ss_ms } from "../../utils/timeFormatter";
import EditShot from "./EditShot/EditShot";
import Shot from "./Shot/Shot";
import styles from "./Timeline.module.css";

interface ITimelineProps {}

function Timeline({}: ITimelineProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currPosition, setCurrPosition] = useState(0);
  const [totalLengthSeconds, setTotalLengthSeconds] = useState(0);
  const [activeShotIndex, setActiveShotIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [currentEditedShot, setCurrentEditedShot] = useState<IShot | null>(
    null
  );

  const obs = useContext(OBSContext);

  // How many pixels per second of the timeline
  const [currentSecondsToWidthMultiplier, setCurrentSecondsToWidthMultiplier] =
    useState(100);

  const [shots, setShots] = useState<IShot[]>([]);

  const editShot = async (shot: IShot): Promise<void> => {
    setCurrentEditedShot(shot);
  };

  const handleShotEditClose = (): void => {
    setCurrentEditedShot(null);
  };
  const handleShotEditSave = async (newShot: IShot): Promise<void> => {
    console.log("SAVE SHOT", currentEditedShot);
    //TODO: Save shot
    setCurrentEditedShot(null);
  };

  const renderShots = useMemo(() => {
    return shots.map((shot, index) => {
      return (
        <Shot
          key={
            index +
            "_" +
            shot.mediaNumber +
            "_" +
            (activeShotIndex === index ? "active" : "not-active")
          }
          selfIndex={index}
          shot={shot}
          currentSecondsToWidthMultiplier={currentSecondsToWidthMultiplier}
          handleClick={(_) => editShot(shot)}
        />
      );
    });
  }, [shots, currentSecondsToWidthMultiplier]);

  const handlePlaybackStatusChange = async (overrideIsPlaying?: boolean) => {
    //DEV
    //TODO: An event
    if (overrideIsPlaying !== undefined && overrideIsPlaying !== null) {
      setIsPlaying(overrideIsPlaying);
    } else {
      setIsPlaying((isPlaying) => !isPlaying);
    }
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

  const handleShot = async (shot: IShot) => {
    console.log("SHOT", shot);

    await obs.call("SetCurrentProgramScene", {
      sceneName: shot.mediaNumber.toString(),
    });
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    let currShotIndex = shots.findIndex(
      (elem) =>
        elem.delaySeconds ===
        getClosestElement(
          shots.map((e) => e.delaySeconds),
          currPosition
        )
    );
    let currentPosition = currPosition; //Need another variable because state doesn't refresh inside the interval

    if (isPlaying) {
      //Set the current shot
      if (currShotIndex === 0) {
        handleShot(shots[0]);
      } else {
        handleShot(shots[currShotIndex - 1]);
      }

      let prevDate = new Date();
      interval = setInterval(() => {
        // console.log(
        //   "INTERVAL",
        //   (new Date().getTime() - prevDate.getTime()) / 1000
        // );
        const delay = (new Date().getTime() - prevDate.getTime()) / 1000;
        prevDate = new Date();
        setCurrPosition((currPosition) => currPosition + delay);
        currentPosition += delay;

        //All shots have already passed
        if (currShotIndex >= shots.length) {
          setTimeout(() => {
            handlePlaybackStatusChange(false);
            if (interval) {
              clearInterval(interval);
            }
          }, shots[shots.length - 1].durationSeconds * 1000);
        }

        //If the time for the current shot has come
        if (shots[currShotIndex].delaySeconds <= currentPosition) {
          handleShot(shots[currShotIndex]);
          setActiveShotIndex(currShotIndex);
          currShotIndex++;
        }
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

  useEffect(() => {
    let prevXPosition: number;
    const handleDragging = (e: MouseEvent) => {
      if (!prevXPosition) {
        prevXPosition = e.clientX;
      }
      setCurrPosition((prevPosition) => {
        const newPosition = prevPosition + (prevXPosition - e.clientX) / 10;
        if (newPosition > totalLengthSeconds) return totalLengthSeconds;
        if (newPosition <= 0) return 0;
        return prevPosition + (prevXPosition - e.clientX) / 10;
      });
      prevXPosition = e.clientX;
    };
    if (isDragging && !isPlaying) {
      window.addEventListener("mousemove", handleDragging);
    }

    return () => {
      window.removeEventListener("mousemove", handleDragging);
    };
  }, [isDragging, isPlaying]);

  useEffect(() => {
    //DEV TODO
    const shotsResponse = [
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
        name: "test shot",
        delaySeconds: 2,
        durationSeconds: 5,
      },
      {
        mediaNumber: 1,
        color: "#a11211",
        name: "test2",
        delaySeconds: 7,
        durationSeconds: 3,
      },
      {
        mediaNumber: 2,
        color: "#00ff22",
        name: "",
        delaySeconds: 10,
        durationSeconds: 5,
      },
    ];

    //Ensure that the shots are sorted
    setShots(shotsResponse);

    setTotalLengthSeconds(
      shotsResponse[shotsResponse.length - 1].delaySeconds +
        shotsResponse[shotsResponse.length - 1].durationSeconds
    );
  }, []);

  return (
    <ActiveShotContext.Provider value={activeShotIndex}>
      <EditShot
        shot={currentEditedShot}
        handleSave={handleShotEditSave}
        handleClose={handleShotEditClose}
      />
      <Box className={`${styles.wrapper} timeline`}>
        <div
          className={styles.timelineWrapper}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
        >
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
        </div>
        <Box className={styles.playbackStatus}>
          <IconButton onClick={() => handleZoomOut()}>
            <ZoomOut />
          </IconButton>
          <IconButton onClick={handleBackward}>
            <SkipPrevious />
          </IconButton>
          <IconButton onClick={() => handlePlaybackStatusChange()}>
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
    </ActiveShotContext.Provider>
  );
}

export default Timeline;
