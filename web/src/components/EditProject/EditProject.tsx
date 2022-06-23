import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IProject } from "../../types/Project.type";
import getProject from "../../helpers/getProject";
import { toast } from "react-toastify";
import Loading from "../Loading/Loading";
import Logo from "../Logo/Logo";
import Typography from "@mui/material/Typography";
import ProjectForm from "../ProjectForm/ProjectForm";
import Box from "@mui/material/Box";

function EditProject() {
  const { project } = useParams();

  const navigate = useNavigate();

  const [originalProject, setOriginalProject] = useState<IProject>({
    name: "",
    totalLengthSeconds: 10,
    media: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const getOriginalProject = async () => {
    setIsLoading(true);
    const projectResponse: {
      project?: IProject;
      error?: AxiosError | unknown;
    } = await getProject(project as string);
    if (projectResponse.error) {
      if (axios.isAxiosError(projectResponse.error)) {
        if ((projectResponse.error as AxiosError)?.response?.status === 404) {
          toast.error("Project not found");
          return navigate("/");
        } else {
          toast.error("Unexpected HTTP error");
        }
      } else {
        toast.error("Unexpected error");
      }
    } else {
      setOriginalProject(projectResponse.project as IProject);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    //Get the project
    getOriginalProject();
  }, []);

  if (isLoading) {
    return <Loading open />;
  } else {
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
        <Logo full height="200px" />
        <Typography variant="h4" textAlign={"center"}>
          Edit the project
        </Typography>

        <ProjectForm originalProject={originalProject} />
      </Box>
    );
  }
}

export default EditProject;
