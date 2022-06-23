import { Medias } from "./Media.type";

interface IProject {
  id?: string;
  name: string;
  media: Medias;
  totalLengthSeconds: number;
  layout?: ReactGridLayout.Layout[];
  isSmallLayout?: boolean;
}

export type { IProject };
