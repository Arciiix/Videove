import { ReactElement, useMemo } from "react";
import { IShot } from "../../types/Shot.type";
import Shot from "./Shot/Shot";

interface IShotsProps {
  shots: IShot[];
  currentSecondsToWidthMultiplier: number;
  isPlaying: boolean;
  handleEditShot: (shot: IShot) => Promise<void>;
  activeShotIndex: number | null;
}

function Shots({
  shots,
  currentSecondsToWidthMultiplier,
  isPlaying,
  handleEditShot,
  activeShotIndex,
}: IShotsProps) {
  const renderShots = useMemo((): ReactElement => {
    return (
      <>
        {shots.map((shot, index) => {
          return (
            <Shot
              key={
                index +
                "_" +
                shot.mediaNumber +
                "_" +
                (activeShotIndex === index ? "active" : "not-active")
              }
              selfIndex={index}
              shot={shot}
              currentSecondsToWidthMultiplier={currentSecondsToWidthMultiplier}
              handleClick={(_) => handleEditShot(shot)}
            />
          );
        })}
      </>
    );
  }, [shots, currentSecondsToWidthMultiplier, isPlaying]);

  return renderShots;
}

export default Shots;
