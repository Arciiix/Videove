import { List, ListItem, ListItemText } from "@mui/material";
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

  return (
    <List>
      {projectsList.map((elem) => {
        return (
          <ListItem onClick={() => navigateToProject(elem)}>
            <ListItemText
              primary={elem.name}
              secondary={`media: ${elem.media.length}`}
            ></ListItemText>
          </ListItem>
        );
      })}
    </List>
  );
}

export default Projects;
