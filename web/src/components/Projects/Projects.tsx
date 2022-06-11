import { List, ListItem, ListItemText } from "@mui/material";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import obsStatusState from "../../recoil/obs-status";
import { IProject } from "../../types/Project.type";

interface IProjectsProps {
  projectsList: IProject[];
}

function Projects({ projectsList }: IProjectsProps) {
  const navigate = useNavigate();
  const obsStatus: boolean = useRecoilValue(obsStatusState);

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
