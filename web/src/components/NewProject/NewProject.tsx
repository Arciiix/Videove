import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import Loading from "../Loading/Loading";
import Logo from "../Logo/Logo";
import ProjectForm from "../ProjectForm/ProjectForm";

function NewProject() {
  const [isLoading, setIsLoading] = useState(false);

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

      <ProjectForm />
    </Box>
  );
}

export default NewProject;
