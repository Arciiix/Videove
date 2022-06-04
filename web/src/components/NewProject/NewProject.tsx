import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import Loading from "../Loading/Loading";
import Logo from "../Logo/Logo";

function NewProject() {
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");

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
      <Typography variant="h4" textAlign={"center"}>
        Create a new project
      </Typography>

      <TextField
        variant="filled"
        label="Project name"
        placeholder="My awesome project"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <Typography color="red">TODO</Typography>
    </Box>
  );
}

export default NewProject;
