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
import { toast } from "react-toastify";
import { useRecoilState } from "recoil";
import ActiveShotContext from "../../context/ActiveShot.context";
import OBSContext from "../../context/OBS.context";
import handleMediaChange from "../../helpers/handleMediaChange";
import currentShotsState from "../../recoil/current-shots";
import isEditingShotsState from "../../recoil/is-editing-shots";
import { IMedia } from "../../types/Media.type";
import { IProject } from "../../types/Project.type";
import { IAddedShot, IShot } from "../../types/Shot.type";
import getClosestElement from "../../utils/getClosestElement";
import getState from "../../utils/getState";
import { secondsTomm_ss_ms } from "../../utils/timeFormatter";
import useConfirm from "../ConfirmationDialog/useConfirm";
import EditShot from "./EditShot/EditShot";
import Shot from "./Shot/Shot";
import styles from "./Timeline.module.css";

interface ITimelineProps {
  media: IMedia[];
  project: IProject;
}

function Timeline({ media, project }: ITimelineProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currPosition, setCurrPosition] = useState(0);
  const [totalLengthSeconds, setTotalLengthSeconds] = useState(0);
  const [activeShotIndex, setActiveShotIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [currentEditedShot, setCurrentEditedShot] = useState<IShot | null>(
    null
  );
  const [isEditingShots, setIsEditingShots] =
    useRecoilState(isEditingShotsState);

  const obs = useContext(OBSContext);
  const confirm = useConfirm();

  // How many pixels per second of the timeline
  const [currentSecondsToWidthMultiplier, setCurrentSecondsToWidthMultiplier] =
    useState(100);

  const [shots, setShots] = useRecoilState(currentShotsState);

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
  const handleShotDelete = async (shot: IShot): Promise<void> => {
    if (shots.length <= 1) {
      toast.warning("You cannot delete the only media left!");
      return;
    }
    const confirmed = await confirm(
      `Do you want to delete media ${shot.mediaNumber}'s shot?`
    );
    if (!confirmed) {
      setCurrentEditedShot(null);
      return;
    }

    console.log("DELETE SHOT", currentEditedShot);
    //TODO: Delete shot

    let newShots = [...shots];
    const oldIndex = newShots.findIndex(
      (e) => e.delaySeconds === shot.delaySeconds
    );

    //Remove the old shot and fix the previous one's duration
    newShots.splice(oldIndex, 1);

    if (oldIndex === 0) {
      newShots[0] = {
        ...newShots[0],
        delaySeconds: 0,
        durationSeconds: newShots?.[1]?.delaySeconds || totalLengthSeconds,
      };
    } else if (oldIndex === shots.length - 1) {
      newShots[newShots.length - 1] = {
        ...newShots[newShots.length - 1],
        durationSeconds:
          totalLengthSeconds - newShots[newShots.length - 1].delaySeconds,
      };
    } else {
      newShots[oldIndex - 1] = {
        ...newShots[oldIndex - 1],
        durationSeconds:
          newShots[oldIndex].delaySeconds - newShots[oldIndex - 1].delaySeconds,
      };
    }
    setShots(newShots);

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

    await handleMediaChange(obs, shot.mediaNumber.toString());
  };

  const addShotToTimeline = async (shot: IAddedShot) => {
    let currPosition: number = await getState(setCurrPosition);
    let totalLengthSeconds = await getState(setTotalLengthSeconds);

    console.log(currPosition);
    setShots((prevShots) => {
      let newShots = [...prevShots];
      //Take the first shot with the delay higher than the inserted one. Insert the new shot before it.
      let isLast = false;
      let insertShotIndex = prevShots.findIndex(
        (element) => element.delaySeconds > currPosition
      );
      if (insertShotIndex < 0) {
        insertShotIndex = prevShots.length;
        isLast = true;
      }
      console.log("insert shot index", insertShotIndex);

      if (isLast) {
        console.log("IS LAST");
        shot.durationSeconds = totalLengthSeconds - currPosition;
      } else {
        //Calculate the shot duration
        let nextShot = prevShots[insertShotIndex];
        console.log("NEXT", nextShot);
        if (nextShot) {
          console.log("THAT ONE");
          shot.durationSeconds = nextShot.delaySeconds - currPosition;
        } else {
          console.error(`Couldn't find the next shot`);
          toast.error(`Couldn't find the next shot`);
        }
      }

      shot.delaySeconds = currPosition;

      newShots.splice(insertShotIndex, 0, shot as IShot);

      //If the previous shot exists, change its duration to fit the new shot
      let prevShot = newShots[insertShotIndex - 1];
      if (prevShot) {
        newShots[insertShotIndex - 1] = {
          ...newShots[insertShotIndex - 1],
          durationSeconds: currPosition - prevShot.delaySeconds,
        };
      }

      console.log(shot);
      console.log(newShots);

      console.log(`Shot at ${insertShotIndex}`);

      return newShots;
    });
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    let lastShotTimeout: ReturnType<typeof setTimeout> | null = null;

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
        console.log("INTERVAL", currentPosition);
        const delay = (new Date().getTime() - prevDate.getTime()) / 1000;
        currentPosition += delay;
        prevDate = new Date();
        setCurrPosition((currPosition) => currPosition + delay);
        //All shots have already passed
        if (currShotIndex >= shots.length) {
          if (!lastShotTimeout) {
            handleShot(shots[shots.length - 1]);
            setActiveShotIndex(shots.length - 1);
            lastShotTimeout = setTimeout(() => {
              console.log("LAST SHOT - PAUSING");
              handlePlaybackStatusChange(false);
              if (interval) {
                clearInterval(interval);
              }
              if (lastShotTimeout) {
                clearTimeout(lastShotTimeout);
              }
              lastShotTimeout = null;
              return;
            }, (shots[shots.length - 1].durationSeconds + shots[shots.length - 1].delaySeconds - currentPosition) * 1000);
          }
          return;
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
          if (
            media.find(
              (elem: IMedia) => elem.number.toString() === e.key.toString()
            )
          ) {
            handleMediaChange(obs, e.key);
            if (isEditingShots) {
              addShotToTimeline({
                mediaNumber: parseInt(e.key),
                color: media.find(
                  (element) => element.number.toString() === e.key.toString()
                )?.color,
                name: "",
              });
            }
          }
      }
    };

    document.addEventListener("wheel", handleWheel);
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("wheel", handleWheel);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [isPlaying, isEditingShots]);

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

    //Quick fix of the shots in case of an error

    //Make sure the shots don't exceed the total length
    const totalLength = project.totalLengthSeconds;
    if (
      totalLength <
      shotsResponse[shotsResponse.length - 1].delaySeconds +
        shotsResponse[shotsResponse.length - 1].durationSeconds
    ) {
      setShots((prev) => {
        return prev.filter(
          (e) => e.delaySeconds + e.durationSeconds < totalLength
        );
      });
    }
    setTotalLengthSeconds(totalLength);

    //Make sure the last shot ends at the total length
    setShots((prev) => {
      return [
        ...prev.slice(0, -1),
        ...[
          {
            ...prev[prev.length - 1],
            durationSeconds: totalLength - prev[prev.length - 1].delaySeconds,
          },
        ],
      ];
    });

    //TODO: Update the actual shots
  }, []);

  return (
    <ActiveShotContext.Provider value={activeShotIndex}>
      <EditShot
        shot={currentEditedShot}
        shotIndex={currentEditedShot ? shots.indexOf(currentEditedShot) : -1}
        handleSave={handleShotEditSave}
        handleClose={handleShotEditClose}
        handleDelete={handleShotDelete}
      />
      <Box className={`${styles.wrapper} timeline`}>
        <div
          className={styles.timelineWrapper}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
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
