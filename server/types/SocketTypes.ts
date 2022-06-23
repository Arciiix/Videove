interface IPlayPayload {
  play: boolean;
  delay?: number;
  startAt: Date;
}

interface ISeekPayload {
  delay: number;
}

export type { IPlayPayload, ISeekPayload };
