enum MediaTypes {
  LOCAL = "Local",
  DROIDCAM = "DroidCam",
  CUSTOM = "Custom (manual)",
  AUDIO = "Audio",
}

type Medias = IMedia[];

interface IMedia {
  number: number;
  color?: string;
  name?: string;
  type: MediaTypes;
  media: Media;
}

class Media {}

class LocalMedia extends Media {
  path: string;

  constructor(path: string) {
    super();
    this.path = path;
  }
}

class DroidCam extends Media {
  url: string;

  constructor(url: string) {
    super();
    this.url = url;
  }
}
class CustomMedia extends Media {}

class AudioMedia extends LocalMedia {}

export { LocalMedia, DroidCam, CustomMedia, AudioMedia, Media, MediaTypes };
export type { Medias, IMedia };
