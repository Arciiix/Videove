interface IShot {
  mediaNumber: number;
  color?: string;
  name: string;
  delaySeconds: number;
  durationSeconds: number;
}
type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
type IAddedShot = Optional<IShot, "durationSeconds" | "delaySeconds">;

export type { IShot, IAddedShot };
