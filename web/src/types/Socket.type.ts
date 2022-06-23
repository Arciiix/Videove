interface IPlay {
  play: boolean;
  delay?: number;
  startAt?: Date;
}
interface ISeek {
  delay: number;
}

export type { IPlay, ISeek };
