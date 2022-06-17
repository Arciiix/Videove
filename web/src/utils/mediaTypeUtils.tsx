import {
  Android,
  ColorLens,
  HelpCenter,
  MusicNote,
  MusicVideo,
} from "@mui/icons-material";
import {
  AudioMedia,
  ColorMedia,
  CustomMedia,
  DroidCam,
  LocalMedia,
  Media,
  MediaTypes,
} from "../types/Media.type";

function getIconForMediaType(mediaType: MediaTypes): JSX.Element {
  switch (mediaType as MediaTypes) {
    case MediaTypes.DROIDCAM:
      return <Android />;
    case MediaTypes.LOCAL:
      return <MusicVideo />;
    case MediaTypes.CUSTOM:
      return <HelpCenter />;
    case MediaTypes.AUDIO:
      return <MusicNote />;
    case MediaTypes.COLOR:
      return <ColorLens />;
    default:
      return <HelpCenter />;
  }
}

function getNewMediaObjForType(mediaType: MediaTypes): Media {
  switch (mediaType as MediaTypes) {
    case MediaTypes.DROIDCAM:
      return new DroidCam("");
    case MediaTypes.LOCAL:
      return new LocalMedia("", 0);
    case MediaTypes.CUSTOM:
      return new CustomMedia(true);
    case MediaTypes.AUDIO:
      return new AudioMedia("", 0);
    case MediaTypes.COLOR:
      return new ColorMedia("#000000");
    default:
      return new CustomMedia(true);
  }
}

export { getIconForMediaType, getNewMediaObjForType };
