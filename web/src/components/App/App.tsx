import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useRecoilState } from "recoil";
import OBSContext from "../../context/OBS.context";
import obsRecordingStreamingStatusState from "../../recoil/obs-recording-streaming-status";
import { IProject } from "../../types/Project.type";
import Loading from "../Loading/Loading";
import MainAppBar from "./MainAppBar/MainAppBar";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [uniqueId, setUniqueId] = useState("");

  const obs = useContext(OBSContext);

  const [obsRecordingStreamingStatus, setObsRecordingStreamingStatus] =
    useRecoilState(obsRecordingStreamingStatusState);

  const [project, setProject] = useState<IProject>({ name: "", media: [] });

  const [isOnAir, setIsOnAir] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  const fetchProject = async (): Promise<void> => {
    const projectRequest = await fetch(`/api/projects/${id}`);
    switch (projectRequest.status) {
      case 200:
        const projectResponse = await projectRequest.json();
        setProject(projectResponse.project);
        setIsLoading(false);
        document.title = `${projectResponse.project.name} - Videove`;
        break;
      case 404:
        toast.error("Project not found!", {
          toastId: uniqueId + "_NOT_FOUND", //To prevent duplicates
        });
        return navigate("/");
      default:
        toast.error("Unknown error!");
        console.error("Unknown error!");
        console.error(projectRequest);
        console.error(await projectRequest.json());
    }
  };

  const getObsRecordingStreamingStatus = async () => {
    const streamingStatus = await obs.send("GetStreamingStatus");

    setObsRecordingStreamingStatus({
      recording: streamingStatus.recording,
      streaming: streamingStatus.streaming,
    });
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
  }, []);

  if (isLoading) return <Loading open />;
  return (
    <div className="App">
      <MainAppBar
        projectName={project.name}
        isOnAir={isOnAir}
        isRecording={obsRecordingStreamingStatus.recording}
        isStreaming={obsRecordingStreamingStatus.streaming}
      />
    </div>
  );
}

export default App;
