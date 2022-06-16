import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useRecoilState } from "recoil";
import OBSContext from "../../context/OBS.context";
import obsRecordingStreamingStatusState from "../../recoil/obs-recording-streaming-status";
import { IProject } from "../../types/Project.type";
import Loading from "../Loading/Loading";
import MainAppBar from "./MainAppBar/MainAppBar";
import ReactPlayer from "react-player";
import MainGrid from "./MainGrid/MainGrid";
import currentActiveMediaState from "../../recoil/current-active-media";
import isOnAirState from "../../recoil/on-air";
import axios, { AxiosError } from "axios";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [uniqueId, setUniqueId] = useState("");

  const obs = useContext(OBSContext);

  const [obsRecordingStreamingStatus, setObsRecordingStreamingStatus] =
    useRecoilState(obsRecordingStreamingStatusState);
  const [currentActiveMedia, setCurrentActiveMedia] = useRecoilState(
    currentActiveMediaState
  );

  const [project, setProject] = useState<IProject>({ name: "", media: [] });

  const [isOnAir, setIsOnAir] = useRecoilState(isOnAirState);
  const navigate = useNavigate();
  const { id } = useParams();

  const fetchProject = async (): Promise<void> => {
    try {
      const projectRequest = await axios.get(`/api/projects/${id}`);
      const projectResponse = projectRequest.data;
      setProject(projectResponse.project);
      setIsLoading(false);
      document.title = `${projectResponse.project.name} - Videove`;
    } catch (err: AxiosError | unknown) {
      if (axios.isAxiosError(err)) {
        if ((err as AxiosError)?.response?.status === 404) {
          toast.error("Project not found");
          return navigate("/");
        } else {
          toast.error("Unexpected HTTP error");
        }
      } else {
        toast.error("Unexpected error");
      }
      console.error(err);
    }
  };

  const getObsRecordingStreamingStatus = async () => {
    const streamingStatus = await obs.send("GetStreamingStatus");

    setObsRecordingStreamingStatus({
      recording: streamingStatus.recording,
      streaming: streamingStatus.streaming,
    });
  };

  const getObsCurrentScene = async () => {
    const scene = await obs.send("GetCurrentScene");

    setCurrentActiveMedia(scene.name);
  };

  useEffect(() => {
    document.title = "Videove";
    fetchProject();
  }, [id]);

  useEffect(() => {
    document.title = isOnAir
      ? `🔴 ${project.name} - Videove`
      : `${project.name} - Videove`;
  }, [isOnAir]);

  useEffect(() => {
    setUniqueId((id ?? "") + new Date().getTime().toString());
    getObsRecordingStreamingStatus();
    getObsCurrentScene();

    obs.on("RecordingStarted", () => {
      setObsRecordingStreamingStatus((prev) => {
        return {
          streaming: prev.streaming,
          recording: true,
        };
      });
    });

    obs.on("RecordingStopped", () => {
      setObsRecordingStreamingStatus((prev) => {
        return {
          streaming: prev.streaming,
          recording: false,
        };
      });
    });

    obs.on("StreamStarted", () => {
      setObsRecordingStreamingStatus((prev) => {
        return {
          recording: prev.recording,
          streaming: true,
        };
      });
    });

    obs.on("StreamStopped", () => {
      setObsRecordingStreamingStatus((prev) => {
        return {
          recording: prev.recording,
          streaming: false,
        };
      });
    });
    obs.on("SwitchScenes", (data) => {
      setCurrentActiveMedia(data["scene-name"]);
    });
  }, []);

  if (isLoading) return <Loading open />;
  return (
    <div className="App">
      <MainAppBar
        projectId={project.id ?? ""}
        projectName={project.name}
        isOnAir={isOnAir}
        isRecording={obsRecordingStreamingStatus.recording}
        isStreaming={obsRecordingStreamingStatus.streaming}
      />
      <MainGrid media={project.media} />
    </div>
  );
}

export default App;
