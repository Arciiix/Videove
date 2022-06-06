import { List, ListItem, ListItemText } from "@mui/material";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { IProject } from "../../types/Project.type";

interface IProjectsProps {
  projectsList: IProject[];
}

function Projects({ projectsList }: IProjectsProps) {
  const navigate = useNavigate();

  const navigateToProject = (project: IProject) => {
    return navigate(`/app/${project.name}`);
  };

  const renderProjects = useMemo(() => {
    return projectsList.map((elem) => {
      return (
        <ListItem onClick={() => navigateToProject(elem)}>
          <ListItemText
            primary={elem.name}
            secondary={`media: ${elem.media.length}`}
          ></ListItemText>
        </ListItem>
      );
    });
  }, [projectsList, navigateToProject]);

  return <List>{renderProjects}</List>;
}

export default Projects;
