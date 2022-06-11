import { Add, Check, Delete, Save } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Icon,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { HexColorPicker } from "react-colorful";
import {
  DroidCam,
  IMedia,
  LocalMedia,
  Medias,
  MediaTypes,
} from "../../types/Media.type";
import { IProject } from "../../types/Project.type";
import getFontColor from "../../utils/getFontColor";
import {
  getIconForMediaType,
  getNewMediaObjForType,
} from "../../utils/mediaTypeUtils";
import useConfirm from "../ConfirmationDialog/useConfirm";
import styles from "./ProjectForm.module.css";

interface IProjectFormProps {
  originalProject?: IProject;
}

function ProjectForm({ originalProject }: IProjectFormProps) {
  const [name, setName] = useState("");
  const [media, setMedia] = useState<Medias>([
    {
      number: 1,
      name: "",
      type: MediaTypes.LOCAL,
      media: new LocalMedia(""),
    },
  ]);

  const [isSelectingColor, setIsSelectingColor] = useState(false);
  const [currentColor, setCurrentColor] = useState("#808080");
  const [changeColorFunction, setChangeColorFunction] = useState<
    (color: string) => void
  >((_) => {});

  const confirm = useConfirm();

  const [nameError, setNameError] = useState("");

  const updateMedia = (oldObj: IMedia, newObj: IMedia): void => {
    const oldIndex = media.findIndex((media) => media.number === oldObj.number);
    const newMedia = [...media];

    newMedia[oldIndex] = newObj;

    setMedia(newMedia);
  };

  const renderMedia = useMemo(() => {
    return media.map((e, index) => {
      return (
        <ListItem
          className={styles.mediaItem}
          key={`media-${index}-${e.number}`}
        >
          <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            width={"100%"}
            justifyContent={"center"}
            gap={2}
          >
            <div
              className={styles.cameraNumber}
              style={{ backgroundColor: e.color ?? "gray" }}
              onClick={() => {
                setChangeColorFunction(() => (color: string) => {
                  updateMedia(e, { ...e, color });
                });

                setIsSelectingColor(true);
              }}
            >
              <span
                style={{
                  color: getFontColor(e.color ?? "#808080"),
                }}
              >
                {e.number}
              </span>
            </div>
            <Select
              className={styles.mediaSelect}
              value={e.type}
              onChange={(elem) => {
                const newMedia: IMedia = {
                  ...e,
                  type: elem.target.value as MediaTypes,
                  media: getNewMediaObjForType(elem.target.value as MediaTypes),
                };

                updateMedia(e, newMedia);
              }}
            >
              <MenuItem
                classes={{ root: styles.flexInline }}
                value={MediaTypes.DROIDCAM}
              >
                <Icon>{getIconForMediaType(MediaTypes.DROIDCAM)}</Icon>
                <Typography>DroidCam</Typography>
              </MenuItem>
              <MenuItem
                classes={{ root: styles.flexInline }}
                value={MediaTypes.LOCAL}
              >
                <Icon>{getIconForMediaType(MediaTypes.LOCAL)}</Icon>
                <Typography>Local media</Typography>
              </MenuItem>
              <MenuItem
                classes={{ root: styles.flexInline }}
                value={MediaTypes.CUSTOM}
              >
                <Icon>{getIconForMediaType(MediaTypes.CUSTOM)}</Icon>
                <Typography>Custom media (manual)</Typography>
              </MenuItem>
              <MenuItem
                classes={{ root: styles.flexInline }}
                value={MediaTypes.AUDIO}
              >
                <Icon>{getIconForMediaType(MediaTypes.AUDIO)}</Icon>
                <Typography>Audio</Typography>
              </MenuItem>
            </Select>
            <ListItemText>
              <TextField
                className={styles.input}
                variant="outlined"
                label="Name"
                value={e.name}
                onChange={(elem) => {
                  const newMedia: IMedia = {
                    ...e,
                    name: elem.target.value,
                  };

                  updateMedia(e, newMedia);
                }}
                margin="dense"
              />

              {e.type === MediaTypes.DROIDCAM && (
                <TextField
                  className={styles.input}
                  variant="outlined"
                  label="URL"
                  value={(e.media as DroidCam).url}
                  onChange={(elem) => {
                    const newMedia = e;
                    (e.media as DroidCam).url = elem.target.value;

                    updateMedia(e, newMedia);
                  }}
                  margin="dense"
                />
              )}

              {(e.type === MediaTypes.LOCAL || e.type === MediaTypes.AUDIO) && (
                <TextField
                  className={styles.input}
                  variant="outlined"
                  label="Path"
                  value={(e.media as LocalMedia).path}
                  onChange={(elem) => {
                    const newMedia = e;
                    (e.media as LocalMedia).path = elem.target.value;

                    updateMedia(e, newMedia);
                  }}
                  margin="dense"
                />
              )}
            </ListItemText>

            <Button
              variant="text"
              onClick={async () => {
                // Ask for confirmation

                const confirmed = await confirm(
                  "Are you sure you want to delete this media?"
                );

                if (!confirmed) return;

                const newMedia = [...media];
                newMedia.splice(newMedia.indexOf(e), 1);

                //Reorder the media numbers
                for (let i = 0; i < newMedia.length; i++) {
                  newMedia[i].number = i + 1;
                }

                setMedia(newMedia);
              }}
            >
              <Delete />
              Delete
            </Button>
          </Box>
        </ListItem>
      );
    });
  }, [media]);

  return (
    <Box>
      <TextField
        className={styles.fullWidth}
        variant="filled"
        label="Project name"
        placeholder="My awesome project"
        required
        error={!!nameError}
        helperText={nameError}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Typography variant="h5" align="center" m={2}>
        Media
      </Typography>
      <Dialog
        open={isSelectingColor}
        onClose={() => {
          setIsSelectingColor(false);
          setChangeColorFunction(() => (_: string) => {});
        }}
      >
        <DialogTitle>Choose the theme color</DialogTitle>
        <DialogContent>
          <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            gap={2}
          >
            <HexColorPicker color={currentColor} onChange={setCurrentColor} />
            <div
              className={styles.colorPreview}
              style={{ backgroundColor: currentColor }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <IconButton
            onClick={() => {
              changeColorFunction(currentColor);
              setIsSelectingColor(false);
              setChangeColorFunction(() => (_: string) => {});
            }}
          >
            <Check />
          </IconButton>
        </DialogActions>
      </Dialog>

      <List>{renderMedia}</List>
      <Button
        fullWidth
        variant="outlined"
        color="primary"
        onClick={() => {
          const newMedia: IMedia = {
            number: media.length + 1,
            name: "",
            type: MediaTypes.LOCAL,
            media: new LocalMedia(""),
          };

          setMedia([...media, newMedia]);
        }}
      >
        <Add />
        Add media
      </Button>
      <Box my={5} width="100%">
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={async () => {
            if (name === "") {
              setNameError("Name is required");
              return;
            }

            const confirmed = await confirm("Are you sure you want to save?");

            if (!confirmed) return;

            let project: IProject;
            if (originalProject) {
              project = originalProject;
            } else {
              project = {
                name: "",
                media: [],
              };
            }

            project = {
              ...project,
              name: name,
              media: media,
            };

            if (originalProject) {
              console.log(`Update project`, project);
            } else {
              console.log(`Create project`, project);
            }
          }}
        >
          <Save />
          Save
        </Button>
      </Box>
    </Box>
  );
}

export default ProjectForm;
