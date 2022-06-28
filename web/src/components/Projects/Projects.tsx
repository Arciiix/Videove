import { Delete, PhoneAndroid } from "@mui/icons-material";
import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from "@mui/material";
import axios, { AxiosError } from "axios";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useRecoilState, useRecoilValue } from "recoil";
import getAllProjects from "../../helpers/getAllProjects";
import obsStatusState from "../../recoil/obs-status";
import projectsState from "../../recoil/projects";
import { IProject } from "../../types/Project.type";
import useConfirm from "../ConfirmationDialog/useConfirm";

interface IProjectsProps {
  projectsList: IProject[];
}

function Projects({ projectsList }: IProjectsProps) {
  const navigate = useNavigate();
  const obsStatus: boolean = useRecoilValue(obsStatusState);
  const [projects, setProjects] = useRecoilState(projectsState);

  const confirm = useConfirm();

  const handleDelete = async (projectId: string) => {
    if (!projectId) return;
    const confirmed = await confirm(
      "Are you sure you want to delete this project?"
    );
    if (confirmed) {
      try {
        await axios.delete(`/api/projects/${projectId}`);

        const projects: IProject[] | null = await getAllProjects();
        if (!projects) {
          toast.error("Couldn't get projects");
        } else {
          setProjects(projects);
        }
      } catch (err: AxiosError | unknown) {
        if (axios.isAxiosError(err)) {
          if (err?.response?.status === 404) {
            toast.error("Project not found");
          }
          toast.error(`Couldn't delete project: ${(err as any).toString()}`);
        } else {
          toast.error(`Couldn't delete project: ${(err as any).toString()}`);
        }
        console.error(err);
      }
    }
  };

  const handleMobileView = (project: IProject) => {
    return navigate(`/mobile/${project.id}`);
  };

  const navigateToProject = (project: IProject) => {
    if (!obsStatus) return;
    return navigate(`/app/${project.id}`);
  };

  const renderProjects = useMemo(() => {
    return projectsList.map((elem) => {
      return (
        <ListItem
          sx={{
            cursor: obsStatus ? "pointer" : "default",
          }}
          onClick={() => navigateToProject(elem)}
          key={elem.id}
        >
          <ListItemIcon>
            <IconButton onClick={() => handleMobileView(elem)}>
              <PhoneAndroid />
            </IconButton>
          </ListItemIcon>
          <ListItemText
            primary={elem.name}
            secondary={`media: ${elem.media.length}`}
          ></ListItemText>
          <ListItemSecondaryAction>
            <IconButton onClick={() => handleDelete(elem.id ?? "")}>
              <Delete />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      );
    });
  }, [projectsList, navigateToProject]);

  return <List>{renderProjects}</List>;
}

export default Projects;
