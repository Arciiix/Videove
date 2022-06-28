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
import { useRecoilState, useRecoilValue } from "recoil";
import { useDebouncedCallback } from "use-debounce";
import ActiveShotContext from "../../context/ActiveShot.context";
import OBSContext from "../../context/OBS.context";
import addShotToTimeline from "../../helpers/addShotToTimeline";
import handleMediaChange from "../../helpers/handleMediaChange";
import { deleteShot, editShot, getShots, saveShots } from "../../helpers/shots";
import currPositionState from "../../recoil/curr-position";
import currentShotsState from "../../recoil/current-shots";
import isEditingShotsState from "../../recoil/is-editing-shots";
import socketIoState from "../../recoil/socketio";
import totalLengthSecondsState from "../../recoil/total-length-seconds";
import { IMedia } from "../../types/Media.type";
import { IProject } from "../../types/Project.type";
import { IAddedShot, IShot } from "../../types/Shot.type";
import { IPlay, ISeek } from "../../types/Socket.type";
import getClosestElement from "../../utils/getClosestElement";
import getState from "../../utils/getState";
import { secondsTomm_ss_ms } from "../../utils/timeFormatter";
import useConfirm from "../ConfirmationDialog/useConfirm";
import Loading from "../Loading/Loading";
import EditShot from "./EditShot/EditShot";
import Shot from "./Shot/Shot";
import styles from "./Timeline.module.css";

interface ITimelineProps {
  media: IMedia[];
  project: IProject;
}

function Timeline({ media, project }: ITimelineProps) {
  const socketio = useRecoilValue(socketIoState);

  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currPosition, setCurrPosition] = useRecoilState(currPositionState);
  const [totalLengthSeconds, setTotalLengthSeconds] = useRecoilState(
    totalLengthSecondsState
  );
  const [activeShotIndex, setActiveShotIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isBusyPlaying, setIsBusyPlaying] = useState(false);
  const [areShotsSaved, setAreShotsSaved] = useState(true);

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

  const seekCallback = async () => {
    const currPos = await getState(setCurrPosition);
    socketio?.emit("seek", {
      delay: currPos,
    } as ISeek);
  };
  const handleSaveShots = async () => {
    console.log("Save shots");
    const shots = await getState(setShots);
    await saveShots(shots, project.id as string);
    setAreShotsSaved(true);
  };

  const seekDebounced = useDebouncedCallback(seekCallback, 1000);
  const saveShotsDebounced = useDebouncedCallback(handleSaveShots, 5000);

  const handleEditShot = async (shot: IShot): Promise<void> => {
    if (isPlaying) return;
    await handleSaveShots();
    setCurrentEditedShot(shot);
  };

  const handleShotEditClose = (): void => {
    setCurrentEditedShot(null);
  };
  const handleShotEditSave = async (newShot: IShot): Promise<void> => {
    if (!currentEditedShot) return;
    const index = shots.indexOf(currentEditedShot);
    await editShot(index, newShot, project.id as string);

    setShots((prev) => {
      let prevShots = [...prev];
      prevShots[index] = newShot;
      return prevShots;
    });

    setCurrentEditedShot(null);
  };
  const handleShotDelete = async (shot: IShot): Promise<void> => {
    await handleSaveShots();
    if (shots.length <= 1) {
      toast.warning("You cannot delete the only shot left!");
      return;
    }
    const confirmed = await confirm(
      `Do you want to delete media ${shot.mediaNumber}'s shot?`
    );
    if (!confirmed) {
      setCurrentEditedShot(null);
      return;
    }

    console.log("DELETE SHOT", shot);
    let newShots = [...shots];
    const oldIndex = newShots.findIndex(
      (e) => e.delaySeconds === shot.delaySeconds
    );

    await deleteShot(oldIndex, project.id as string);

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
          handleClick={(_) => handleEditShot(shot)}
        />
      );
    });
  }, [shots, currentSecondsToWidthMultiplier, isPlaying]);

  const handlePlaybackStatusChange = async (overrideIsPlaying?: boolean) => {
    const isBusyPlayingCurr = await getState(setIsBusyPlaying);

    setIsBusyPlaying(true);
    //DEV
    //TODO: An event
    let newIsPlaying;
    if (overrideIsPlaying !== undefined && overrideIsPlaying !== null) {
      newIsPlaying = overrideIsPlaying;
    } else {
      newIsPlaying = !(await getState(setIsPlaying));
    }

    if (newIsPlaying) {
      const delay = await getState(setCurrPosition);
      socketio?.emit("play", {
        play: true,
        delay,
        startAt: new Date(new Date().getTime() + 1000),
      } as IPlay);

      setTimeout(() => {
        setIsPlaying(true);
      }, 1000);
    } else {
      setIsPlaying(false);
      socketio?.emit("play", {
        play: false,
      } as IPlay);
    }

    setIsBusyPlaying(false);
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

    setCurrPosition((currPosition) => {
      if (currPosition - 1 < 0) return 0; //Only if not at start
      return currPosition - 1;
    });

    //Emit an event so that videos can seek to the new position
    seekDebounced();
  }, [isPlaying, currPosition]);

  const handleForward = useCallback(() => {
    if (isPlaying) return; //Only if not playing
    if (currPosition + 1 > totalLengthSeconds) return; //Only if not at end

    setCurrPosition((currPosition) => {
      if (currPosition + 1 > totalLengthSeconds) return totalLengthSeconds;
      return currPosition + 1;
    });

    //Emit an event so that videos can seek to the new position
    seekDebounced();
  }, [isPlaying, currPosition]);

  const handleShot = async (shot: IShot) => {
    console.log("SHOT", shot);

    await handleMediaChange(obs, shot.mediaNumber.toString());
  };

  const handleAddShotToTimeline = async (shot: IAddedShot) => {
    let currPosition: number = await getState(setCurrPosition);
    let totalLengthSeconds = await getState(setTotalLengthSeconds);

    await addShotToTimeline(shot, currPosition, totalLengthSeconds, setShots);

    setAreShotsSaved(false);
    saveShotsDebounced();
  };

  const fetchShots = async (): Promise<IShot[] | null> => {
    const shotsResponse = await getShots(project.id as string);
    if (!shotsResponse) {
      return null;
    }
    setShots(shotsResponse);
    setIsLoading(false);
    return shotsResponse;
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
          console.log("Last shot...");
          return;
        }
        //If the time for the current shot has come
        if (shots[currShotIndex].delaySeconds <= currentPosition) {
          handleShot(shots[currShotIndex]);
          setActiveShotIndex(currShotIndex);
          currShotIndex++;
        }
      });

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
      }, (totalLengthSeconds - currPosition) * 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
      if (lastShotTimeout) {
        clearTimeout(lastShotTimeout);
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
        case "s":
          if (e.ctrlKey) {
            e.preventDefault();
            e.stopImmediatePropagation();
            //Save
            handleSaveShots();
          }
          break;
        default:
          if (
            media.find(
              (elem: IMedia) => elem.number.toString() === e.key.toString()
            )
          ) {
            handleMediaChange(obs, e.key);
            if (isEditingShots) {
              handleAddShotToTimeline({
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
      seekDebounced();
    };
    if (isDragging && !isPlaying) {
      window.addEventListener("mousemove", handleDragging);
    }

    return () => {
      window.removeEventListener("mousemove", handleDragging);
    };
  }, [isDragging, isPlaying]);

  useEffect(() => {
    fetchShots().then((shots) => {
      const totalLength = project.totalLengthSeconds;
      setTotalLengthSeconds(totalLength);
      //If there's no shots, add a new one, with full length
      if (!shots || shots.length === 0) {
        console.log("No shots!");
        setShots([
          {
            name: "Initial shot",
            mediaNumber: 0,
            color: media.find((e) => e.number === 0)?.color ?? "#808080",
            delaySeconds: 0,
            durationSeconds: totalLength,
          },
        ]);
        setAreShotsSaved(false);
        saveShotsDebounced();
        return;
      }

      //Quick fix of the shots in case of an error
      //Make sure the shots don't exceed the total length
      if (
        totalLength <
        shots[shots.length - 1].delaySeconds +
          shots[shots.length - 1].durationSeconds
      ) {
        setShots((prev) => {
          return prev.filter(
            (e) => e.delaySeconds + e.durationSeconds < totalLength
          );
        });
      }

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

      saveShotsDebounced();
    });
  }, []);

  if (isLoading) {
    return <Loading open={true} />;
  }
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
          {!areShotsSaved && "Shots not saved!"}
        </Box>
      </Box>
    </ActiveShotContext.Provider>
  );
}

export default Timeline;
