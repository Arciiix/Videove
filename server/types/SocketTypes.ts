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
  nextShot?: number;
}

interface IMedia {
  number: number;
  color?: string;
  name?: string;
  type: string;
  media: any;
}

export type { IPlayPayload, ISeekPayload, IMediaChangePayload };
