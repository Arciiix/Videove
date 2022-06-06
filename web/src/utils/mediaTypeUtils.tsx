import { Android, HelpCenter, MusicVideo } from "@mui/icons-material";
import {
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
    default:
      return <HelpCenter />;
  }
}

function getNewMediaObjForType(mediaType: MediaTypes): Media {
  switch (mediaType as MediaTypes) {
    case MediaTypes.DROIDCAM:
      return new DroidCam("");
    case MediaTypes.LOCAL:
      return new LocalMedia("");
    case MediaTypes.CUSTOM:
      return new CustomMedia();
    default:
      return new CustomMedia();
  }
}

export { getIconForMediaType, getNewMediaObjForType };
