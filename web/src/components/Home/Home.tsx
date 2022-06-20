import { Box, Button, TextField, Typography } from "@mui/material";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useRecoilState } from "recoil";
import { io } from "socket.io-client";
import OBSContext from "../../context/OBS.context";
import getAllProjects from "../../helpers/getAllProjects";
import obsStatusState from "../../recoil/obs-status";
import projectsState from "../../recoil/projects";
import socketIoState from "../../recoil/socketio";
import { IProject } from "../../types/Project.type";
import Loading from "../Loading/Loading";
import Logo from "../Logo/Logo";
import OBSStatus from "../OBSStatus/OBSStatus";
import Projects from "../Projects/Projects";

import styles from "./Home.module.css";

function Home() {
  const navigate = useNavigate();

  const obs = useContext(OBSContext);
  const [socket, setSocket] = useRecoilState(socketIoState);

  const [uniqueId, setUniqueId] = useState("");

  const [obsStatus, setObsStatus] = useRecoilState(obsStatusState);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useRecoilState(projectsState);

  const [address, setAddress] = useState("ws://localhost:4455");
  const [password, setPassword] = useState("");

  const connect = async () => {
    setIsLoading(true);
    try {
      await obs.connect(address, password);
      setObsStatus(true);
      toast.success("Connected successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Unexpected error");
      setObsStatus(false);
    }
    setIsLoading(false);
  };

  const getProjects = async () => {
    setIsLoading(true);
    const projects: IProject[] | null = await getAllProjects();
    if (!projects) {
      toast.error("Couldn't get projects");
    } else {
      setProjects(projects);
      setIsLoading(false);
    }
  };

  const newProject = async () => {
    return navigate("/newProject");
  };

  useEffect(() => {
    document.title = "Videove";
    setUniqueId("HOME" + new Date().getTime());
    getProjects();

    if (!socket) {
      const socket = io();
      setSocket(socket);
    }
  }, []);

  return (
    <Box
      className="Home"
      display="flex"
      justifyContent={"center"}
      alignItems="center"
      width="100%"
      flexDirection={"column"}
      gap={2}
    >
      <Loading open={isLoading} />
      <Logo full height="200px" dontClick />

      <Typography variant="h5">OBS socket info</Typography>
      <TextField
        variant="filled"
        label="Adress"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <TextField
        variant="filled"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={connect}>
        Connect
      </Button>

      <Typography variant="h5">Which project this time?</Typography>
      <Projects projectsList={projects} />

      <Button onClick={newProject}>Maybe new?</Button>

      <Box>
        <OBSStatus connected={obsStatus} />
        <Typography variant="body2">
          Made with{" "}
          <span role="img" aria-label="heart">
            ❤️
          </span>{" "}
          by{" "}
          <a
            className={styles.href}
            href="https://github.com/Arciiix"
            target={"_blank"}
            rel="noreferrer"
          >
            Arciiix
          </a>
        </Typography>
      </Box>
    </Box>
  );
}

export default Home;
