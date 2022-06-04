import { List, ListItem, ListItemText } from "@mui/material";
import { Navigate, useNavigate } from "react-router-dom";
import { IProject } from "./Projects.type";

interface IProjectsProps {
  projectsList: IProject[];
}

function Projects({ projectsList }: IProjectsProps) {
  const navigate = useNavigate();

  const navigateToProject = (project: IProject) => {
    return navigate(`/app/${project.name}`);
  };

  return (
    <List>
      {projectsList.map((elem) => {
        return (
          <ListItem onClick={() => navigateToProject(elem)}>
            <ListItemText
              primary={elem.name}
              secondary={`Cameras: ${elem.cameras}`}
            ></ListItemText>
          </ListItem>
        );
      })}
    </List>
  );
}

export default Projects;
