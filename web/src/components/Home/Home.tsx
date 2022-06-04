import { Box, Button, TextField, Typography } from "@mui/material";
import OBSWebSocket from "obs-websocket-js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useRecoilState } from "recoil";
import obsStatusState from "../../recoil/obs-status";
import Loading from "../Loading/Loading";
import Logo from "../Logo/Logo";
import OBSStatus from "../OBSStatus/OBSStatus";
import Projects from "../Projects/Projects";

import styles from "./Home.module.css";

interface IHomeProps {
  obs: OBSWebSocket;
}
function Home({ obs }: IHomeProps) {
  const navigate = useNavigate();

  const [obsStatus, setObsStatus] = useRecoilState(obsStatusState);
  const [isLoading, setIsLoading] = useState(false);

  const [address, setAddress] = useState("localhost:4444");
  const [password, setPassword] = useState("");

  const connect = async () => {
    setIsLoading(true);
    try {
      await obs.connect({ address: address, password: password });
      setObsStatus(true);
      toast.success("Connected successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.error || "Unexpected error");
      setObsStatus(false);
    }
    setIsLoading(false);
  };

  const newProject = async () => {
    return navigate("/newProject");
  };

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
      <Logo full height="200px" />

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
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={connect}>
        Connect
      </Button>

      <Typography variant="h5">Which project this time?</Typography>
      <Projects
        projectsList={[
          {
            name: "test",
            cameras: 2,
          },
        ]}
      />

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
