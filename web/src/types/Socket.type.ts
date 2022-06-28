import { IMedia } from "./Media.type";
import { IShot } from "./Shot.type";

interface IPlay {
  play: boolean;
  delay?: number;
  startAt?: Date;
}
interface ISeek {
  delay: number;
}

interface IMediaChange {
  media: IMedia;
  nextShotDate?: Date;
}

export type { IPlay, ISeek, IMediaChange };
