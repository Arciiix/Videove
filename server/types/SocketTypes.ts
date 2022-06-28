interface IPlayPayload {
  play: boolean;
  delay?: number;
  startAt: Date;
}

interface ISeekPayload {
  delay: number;
}

interface IMediaChangePayload {
  media: IMedia;
  nextShotDate?: Date;
}

interface IMedia {
  number: number;
  color?: string;
  name?: string;
  type: string;
  media: any;
}
interface IShot {
  mediaNumber: number;
  color?: string;
  name: string;
  delaySeconds: number;
  durationSeconds: number;
}

export type { IPlayPayload, ISeekPayload, IMediaChangePayload };
