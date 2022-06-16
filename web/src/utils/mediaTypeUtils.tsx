import {
  Android,
  HelpCenter,
  MusicNote,
  MusicVideo,
} from "@mui/icons-material";
import {
  AudioMedia,
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
      return new CustomMedia(false);
    case MediaTypes.AUDIO:
      return new AudioMedia("", 0);
    default:
      return new CustomMedia(false);
  }
}

export { getIconForMediaType, getNewMediaObjForType };
