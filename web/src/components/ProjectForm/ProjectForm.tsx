import { Add, Check, Delete, Refresh, Save } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  Icon,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import axios, { AxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ColorMedia,
  CustomMedia,
  DroidCam,
  IMedia,
  LocalMedia,
  Medias,
  MediaTypes,
} from "../../types/Media.type";
import { IProject } from "../../types/Project.type";
import getEnumKeyByEnumValue from "../../utils/getEnumKeyByEnumValue";
import getFontColor from "../../utils/getFontColor";
import {
  getIconForMediaType,
  getNewMediaObjForType,
} from "../../utils/mediaTypeUtils";
import numericInputRegexp from "../../utils/numericInputRegex";
import useConfirm from "../ConfirmationDialog/useConfirm";
import styles from "./ProjectForm.module.css";

interface IProjectFormProps {
  originalProject?: IProject;
}

function ProjectForm({ originalProject }: IProjectFormProps) {
  const [name, setName] = useState("");
  const [media, setMedia] = useState<Medias>([
    {
      number: 0,
      name: "Output",
      type: MediaTypes.CUSTOM,
      media: new CustomMedia(true),
    },
  ]);
  const [totalLength, setTotalLength] = useState({
    minutes: 0,
    seconds: 10,
  });

  const [isSelectingColor, setIsSelectingColor] = useState(false);
  const [currentColor, setCurrentColor] = useState("#808080");
  const [changeColorFunction, setChangeColorFunction] = useState<
    (color: string) => void
  >((_) => {});

  const [availablePaths, setAvailablePaths] = useState<string[]>([]);

  const confirm = useConfirm();
  const navigate = useNavigate();

  const [nameError, setNameError] = useState("");

  const updateMedia = (oldObj: IMedia, newObj: IMedia): void => {
    const oldIndex = media.findIndex((media) => media.number === oldObj.number);
    const newMedia = [...media];

    newMedia[oldIndex] = newObj;

    setMedia(newMedia);
  };

  const renderPaths = useMemo((): JSX.Element[] => {
    return availablePaths.map((e: string) => {
      return (
        <MenuItem key={`path-${e}`} value={e}>
          {e}
        </MenuItem>
      );
    });
  }, [availablePaths]);

  const fetchVideoList = async (): Promise<void> => {
    try {
      const response = await axios.get("/api/cdn/video/list");

      setAvailablePaths(response.data.files as string[]);
    } catch (err) {
      console.error(err);
      toast.error("Error while getting the video list");
    }
  };

  useEffect(() => {
    if (originalProject) {
      setName(originalProject.name);
      setTotalLength({
        minutes: Math.floor(originalProject.totalLengthSeconds / 60),
        seconds: Math.floor(originalProject.totalLengthSeconds % 60),
      });
      setMedia(
        originalProject.media.map((e) => {
          return {
            ...e,
            type: MediaTypes[e.type as keyof typeof MediaTypes],
          };
        })
      );
      console.log(media);
    }
    fetchVideoList();
  }, []);

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
              <MenuItem
                classes={{ root: styles.flexInline }}
                value={MediaTypes.COLOR}
              >
                <Icon>{getIconForMediaType(MediaTypes.COLOR)}</Icon>
                <Typography>Color</Typography>
              </MenuItem>
            </Select>
            <ListItemText>
              <Box display={"flex"} flexDirection={"column"} gap={2}>
                <TextField
                  classes={{ root: styles.input }}
                  className={styles.input}
                  variant="outlined"
                  label="Name"
                  value={e.name ?? ""}
                  onChange={(elem) => {
                    const newMedia: IMedia = {
                      ...e,
                      name: elem.target.value,
                    };

                    updateMedia(e, newMedia);
                  }}
                  inputProps={{ maxLength: 20 }}
                  fullWidth
                  margin="dense"
                />

                {e.type === MediaTypes.DROIDCAM && (
                  <TextField
                    classes={{ root: styles.input }}
                    className={styles.input}
                    variant="outlined"
                    label="URL"
                    value={(e.media as DroidCam).url ?? ""}
                    onChange={(elem) => {
                      const newMedia = e;
                      (e.media as DroidCam).url = elem.target.value;

                      updateMedia(e, newMedia);
                    }}
                    fullWidth
                    margin="dense"
                  />
                )}

                {(e.type === MediaTypes.LOCAL ||
                  e.type === MediaTypes.AUDIO) && (
                  <Box display={"flex"} flexDirection={"column"} gap={2}>
                    <FormControl
                      classes={{ root: styles.input }}
                      className={styles.input}
                      fullWidth
                    >
                      <InputLabel id="path-select-label">Path</InputLabel>
                      <Select
                        labelId="path-select-label"
                        variant="outlined"
                        label="Path"
                        value={(e.media as LocalMedia).path}
                        onChange={(elem) => {
                          const newMedia = e;
                          (e.media as LocalMedia).path = elem.target.value;

                          updateMedia(e, newMedia);
                        }}
                        fullWidth
                        placeholder="Select a path"
                        margin="dense"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {renderPaths}
                      </Select>
                    </FormControl>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => fetchVideoList()}
                    >
                      <Refresh />
                      Refresh
                    </Button>

                    <TextField
                      classes={{ root: styles.input }}
                      className={styles.input}
                      variant="outlined"
                      label="Delay [s]"
                      value={(e.media as LocalMedia).delayStringHelper ?? ""}
                      fullWidth
                      onChange={(elem) => {
                        if (!numericInputRegexp.test(elem.target.value)) return;
                        let newValue = elem.target.value;
                        if (isNaN(parseFloat(newValue))) {
                          newValue = "0";
                        }
                        const newMedia = e;
                        (e.media as LocalMedia).delayStringHelper = newValue;
                        //If the next character is a dot, don't change the current value (user wills to write the decimal part of the number)
                        //Otherwise, parse the value of the input as float and update it in the media object
                        if (newValue.slice(-1) !== ".") {
                          (e.media as LocalMedia).delay = parseFloat(newValue);
                        }

                        updateMedia(e, newMedia);
                      }}
                      margin="dense"
                    />
                  </Box>
                )}

                {e.type === MediaTypes.CUSTOM && (
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          value={(e.media as CustomMedia).screenSharePreview}
                          defaultChecked
                          onChange={(elem) => {
                            const newMedia = e;
                            (e.media as CustomMedia).screenSharePreview =
                              elem.target.checked;

                            updateMedia(e, newMedia);
                          }}
                        />
                      }
                      label="Preview by screen sharing"
                    />
                  </FormGroup>
                )}

                {e.type === MediaTypes.COLOR && (
                  <div
                    className={styles.colorPicker}
                    style={{
                      backgroundColor:
                        (e.media as ColorMedia).color ?? "#000000",
                      color: getFontColor(
                        (e.media as ColorMedia).color ?? "#000000"
                      ),
                    }}
                    onClick={(elem) => {
                      setChangeColorFunction(() => (color: string) => {
                        updateMedia(e, {
                          ...e,
                          media: {
                            ...e.media,
                            color,
                          },
                        });
                      });

                      setIsSelectingColor(true);
                    }}
                  >
                    Color
                  </div>
                )}
              </Box>
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
                  newMedia[i].number = i;
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
  }, [media, availablePaths]);

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
        Total length
      </Typography>
      <Box display="flex" justifyContent="center" alignItems="center">
        <TextField
          variant="filled"
          type="number"
          label="Minutes"
          required
          margin="dense"
          value={totalLength.minutes} /* TODO: Add leading zero */
          onChange={(e) => {
            if (parseInt(e.target.value) < 0) {
              setTotalLength({
                minutes: 0,
                seconds: totalLength.seconds,
              });
            } else {
              setTotalLength({
                minutes: parseInt(e.target.value) || 0,
                seconds: totalLength.seconds,
              });
            }
          }}
        />
        <Typography p={1}>:</Typography>
        <TextField
          variant="filled"
          type="number"
          label="Seconds"
          required
          margin="dense"
          value={totalLength.seconds} /* TODO: Add leading zero */
          onChange={(e) => {
            if (parseInt(e.target.value) < 0) {
              setTotalLength({
                minutes: totalLength.minutes,
                seconds: 59,
              });
            } else if (parseInt(e.target.value) >= 60) {
              setTotalLength({
                minutes: totalLength.minutes,
                seconds: 0,
              });
            } else {
              setTotalLength({
                minutes: totalLength.minutes,
                seconds: parseInt(e.target.value) || 0,
              });
            }
          }}
        />
      </Box>
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
            number: media.length,
            name: "",
            type: MediaTypes.LOCAL,
            media: new LocalMedia("", 0),
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
                totalLengthSeconds: 10,
                media: [],
              };
            }

            project = {
              ...project,
              name: name,
              totalLengthSeconds:
                totalLength.minutes * 60 + totalLength.seconds,
              media: media,
            };

            const serializedProject = project;
            serializedProject.media = serializedProject.media.map((e) => {
              return {
                ...e,
                type: getEnumKeyByEnumValue(MediaTypes, e.type) as string,
              };
            });

            serializedProject.layout = undefined;
            if (originalProject) {
              console.log(`Update project`, serializedProject);

              try {
                //TODO: Test it
                const response = await axios.put("/api/projects/update", {
                  id: serializedProject.id,
                  project: serializedProject,
                });

                toast.success("Project updated");

                // Navigate to the home page
                return navigate(`/`);
              } catch (err: AxiosError | unknown) {
                if (axios.isAxiosError(err)) {
                  if (err?.response?.status === 400) {
                    toast.error(
                      `Error validating: ${
                        ((err as AxiosError)?.response?.data as any)?.error
                      }`
                    );
                  } else if (err?.response?.status === 404) {
                    setNameError("Project doesn't exist");
                  } else {
                    toast.error(
                      `Error updating project: status ${
                        (err as AxiosError)?.status
                      } ${JSON.stringify((err as AxiosError)?.response?.data)}`
                    );
                  }
                } else {
                  toast.error(
                    `Error updating project: ${(err as any).toString()}`
                  );
                }
                console.error(err);
              }
            } else {
              console.log(`Create project`, serializedProject);
              try {
                const response = await axios.post(
                  "/api/projects/create",
                  serializedProject
                );
                toast.success("Project created");
                // Navigate to the home page
                return navigate(`/`);
              } catch (err: AxiosError | unknown) {
                if (axios.isAxiosError(err)) {
                  if (err?.response?.status === 400) {
                    toast.error(
                      `Error validating: ${
                        ((err as AxiosError)?.response?.data as any)?.error
                      }`
                    );
                  } else if (err?.response?.status === 409) {
                    setNameError("Project already exists");
                  } else {
                    toast.error(
                      `Error creating project: status ${
                        (err as AxiosError)?.status
                      } ${JSON.stringify((err as AxiosError)?.response?.data)}`
                    );
                  }
                } else {
                  toast.error(
                    `Error creating project: ${(err as any).toString()}`
                  );
                }
                console.error(err);
              }
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
