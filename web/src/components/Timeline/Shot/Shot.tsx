import { useContext } from "react";
import ActiveShotContext from "../../../context/ActiveShot.context";
import { IShot } from "../../../types/Shot.type";
import getFontColor from "../../../utils/getFontColor";
import styles from "./Shot.module.css";

interface IShotProps {
  shot: IShot;
  currentSecondsToWidthMultiplier: number;
  selfIndex: number;
}

function Shot({
  shot,
  currentSecondsToWidthMultiplier,
  selfIndex,
}: IShotProps) {
  const activeShotIndex = useContext(ActiveShotContext);

  return (
    <div
      className={`${styles.timelineItem} ${
        activeShotIndex === selfIndex ? styles.active : ""
      }`}
      style={{
        backgroundColor: shot.color ?? "#808080",
        // left: `${shot.delaySeconds * currentSecondsToWidthMultiplier}px`,
        width: `${shot.durationSeconds * currentSecondsToWidthMultiplier}px`,
        color: getFontColor(shot.color ?? "#808080"),
      }}
    >
      <div
        className={styles.mediaNumber}
        style={{ color: getFontColor(shot.color ?? "#808080") }}
      >
        {shot.mediaNumber}
      </div>
      <div
        className={styles.mediaDescription}
        style={{ color: getFontColor(shot.color ?? "#808080") }}
      >
        {shot.name}
      </div>
    </div>
  );
}

export default Shot;
