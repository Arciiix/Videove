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
  delay: number;
  delayStringHelper?: string;

  constructor(path: string, delay: number) {
    super();
    this.path = path;
    this.delay = delay;
  }
}

class DroidCam extends Media {
  url: string;

  constructor(url: string) {
    super();
    this.url = url;
  }
}
class CustomMedia extends Media {
  screenSharePreview: boolean;
  screenShareStreamObj?: MediaStream;

  constructor(screenSharePreview: boolean) {
    super();
    this.screenSharePreview = screenSharePreview;
  }
}

class AudioMedia extends LocalMedia {}

export { LocalMedia, DroidCam, CustomMedia, AudioMedia, Media, MediaTypes };
export type { Medias, IMedia };
