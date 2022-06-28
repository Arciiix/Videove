import { LiveTv } from "@mui/icons-material";
import { Box } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useRecoilState } from "recoil";
import { io } from "socket.io-client";
import getNextShotTime from "../../helpers/getNextShotTime";
import getProject from "../../helpers/getProject";
import { getShots } from "../../helpers/shots";
import socketIoState from "../../recoil/socketio";
import { IMedia } from "../../types/Media.type";
import { IProject } from "../../types/Project.type";
import { IShot } from "../../types/Shot.type";
import { IMediaChange, IPlay, ISeek } from "../../types/Socket.type";
import getClosestElement from "../../utils/getClosestElement";
import getState from "../../utils/getState";
import { secondsTomm_ss_ms } from "../../utils/timeFormatter";
import CurrentMedia from "../CurrentMedia/CurrentMedia";
import MediaNumber from "../Feed/MediaNumber/MediaNumber";
import Loading from "../Loading/Loading";
import Logo from "../Logo/Logo";
import Shots from "../Timeline/Shots";
import Timeline from "../Timeline/Timeline";

import styles from "./MobileView.module.css";

function MobileView() {
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useRecoilState(socketIoState);
  const [currPosition, setCurrPosition] = useState(0);
  const [delayBeforeMyShot, setDelayBeforeMyShot] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shots, setShots] = useState<IShot[]>([]);
  const [activeShot, setActiveShot] = useState<number>(-1);
  const [activeShotIndex, setActiveShotIndex] = useState<number>(-1);
  const [nextShot, setNextShot] = useState<number>(-1);
  const [totalLengthSeconds, setTotalLengthSeconds] = useState(10);
  const [currentSecondsToWidthMultiplier, setCurrentSecondsToWidthMultiplier] =
    useState(100);
  const [mediaObj, setMediaObj] = useState<IMedia | null>(null);
  const [allMedia, setAllMedia] = useState<IMedia[]>([]);
  const [project, setProject] = useState<IProject>();
  const [nextShotDescription, setNextShotDescription] = useState("");

  const { projectId, media } = useParams();

  const fetchShots = async (): Promise<IShot[] | null> => {
    const shotsResponse = await getShots(projectId as string);
    if (!shotsResponse) {
      toast.error("Couldn't get shots!");
      return null;
    }
    setShots(shotsResponse);
    setTotalLengthSeconds(
      shotsResponse[shotsResponse.length - 1].delaySeconds +
        shotsResponse[shotsResponse.length - 1].durationSeconds
    );

    return shotsResponse;
  };

  const fetchProject = async (): Promise<void> => {
    const project = await getProject(projectId as string);
    if (project.error) {
      toast.error("Error while getting the project data");
      return;
    }
    setMediaObj(
      (project.project as IProject).media.find(
        (e) => e.number.toString() === media
      ) as IMedia
    );
    setProject(project.project as IProject);
    setAllMedia(project.project?.media as IMedia[]);
    await fetchShots();
    setIsLoading(false);
  };

  const getCurrentShotIndex = async (): Promise<number> => {
    let shots = await getState(setShots);
    let currPosition = await getState(setCurrPosition);
    let nextShot = [...shots].findIndex((e) => e.delaySeconds > currPosition);
    if (nextShot > 0) {
      return nextShot - 1;
    } else {
      return shots.length - 1;
    }
  };
  const getTimeOfMyNextShot = async (): Promise<number> => {
    let shots = await getState(setShots);
    let currPosition = await getState(setCurrPosition);

    let { date } = await getNextShotTime(
      currPosition,
      shots,
      parseInt(media as string)
    );

    return (date.getTime() - new Date().getTime()) / 1000;
  };

  const getNextMyShotDescription = async (): Promise<string | null> => {
    let shots = await getState(setShots);
    let activeShot = await getState(setActiveShot);
    if (activeShot === parseInt(media as string)) {
      let currShotIndex = await getState(setActiveShotIndex);

      setNextShotDescription(shots[currShotIndex].name);
      return shots[currShotIndex].name;
    }

    let nextShot = await getTimeOfMyNextShot();
    let currPosition = await getState(setCurrPosition);

    let nextShotObj = shots.find(
      (e) => currPosition + nextShot <= e.delaySeconds + 0.1
    );
    setNextShotDescription(nextShotObj?.name || "");
    return nextShotObj?.name || null;
  };

  const handleShot = async (shot: IShot) => {
    setActiveShot(shot.mediaNumber);
    setActiveShotIndex(await getCurrentShotIndex());
    setDelayBeforeMyShot(await getTimeOfMyNextShot());
    getNextMyShotDescription();
  };

  const getStateBackgroundColor = useMemo(() => {
    if (activeShot === parseInt(media as string)) return "hsl(337, 100%, 34%)";
    if (nextShot === parseInt(media as string)) return "hsl(152, 100%, 37%)";

    return "transparent";
  }, [activeShot, nextShot]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    let lastShotTimeout: ReturnType<typeof setTimeout> | null = null;

    if (isPlaying) {
      let prevDate = new Date();
      interval = setInterval(() => {
        const delay = (new Date().getTime() - prevDate.getTime()) / 1000;
        prevDate = new Date();
        setCurrPosition((currPosition) => currPosition + delay);
        setDelayBeforeMyShot((prevDelay) => prevDelay - delay);
        getNextMyShotDescription();
      });

      lastShotTimeout = setTimeout(() => {
        console.log("LAST SHOT - PAUSING");
        setIsPlaying(false);
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

      if (!data.play) {
        setIsPlaying(false);
        return;
      }
      // Start playing at the given time
      setTimeout(() => {
        setCurrPosition(data.delay ?? 0);
        setIsPlaying(true);
      }, new Date(data.startAt ?? new Date().getTime()).getTime() - new Date().getTime());
    });

    socketIo.on("seek", (data: ISeek) => {
      setCurrPosition(data.delay ?? 0);
    });

    socketIo.on("mediaChange", async (data: IMediaChange) => {
      if (data.nextShot) {
        setNextShot(data.nextShot);
      } else {
        setNextShot(-1);
      }
      setActiveShot(data.media.number);
      setActiveShotIndex(await getCurrentShotIndex());
      setDelayBeforeMyShot(await getTimeOfMyNextShot());
      getNextMyShotDescription();
    });

    fetchProject();
  }, []);

  if (isLoading) {
    return <Loading open />;
  }
  return (
    <Box className={styles.wrapper}>
      <Box className={styles.media}>
        <Logo width={"100px"} height={"100px"} dontClick />
        <MediaNumber
          number={parseInt(mediaObj?.number?.toString() ?? (media as string))}
          color={mediaObj?.color ?? "#808080"}
        />
        <span className={styles.myMediaDelay}>
          {Math.floor(delayBeforeMyShot + 1)}
        </span>
        <span className={styles.mediaDescripiton}>
          {/* {shots[activeShotIndex]?.name ?? ""} */}
          {nextShotDescription}
        </span>
        <div
          className={styles.state}
          style={{
            backgroundColor: getStateBackgroundColor,
          }}
        ></div>
        <div className={styles.playbackStatusText}>
          {secondsTomm_ss_ms(currPosition)} /{" "}
          {secondsTomm_ss_ms(totalLengthSeconds)}
        </div>
        <CurrentMedia fullSize />
      </Box>
      <div className={`${styles.timelineWrapper} timeline`}>
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
          <Shots
            shots={shots}
            currentSecondsToWidthMultiplier={currentSecondsToWidthMultiplier}
            isPlaying={isPlaying}
            handleEditShot={async () => {}}
            activeShotIndex={activeShotIndex}
          />
        </div>
      </div>
    </Box>
  );
}
export default MobileView;
