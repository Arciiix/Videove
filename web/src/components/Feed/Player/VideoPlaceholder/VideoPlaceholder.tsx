import Logo from "../../../Logo/Logo";
import styles from "./VideoPlaceholder.module.css";

interface IVideoPlaceholderProps {
  width: string;
  height: string;
}

function VideoPlaceholder({ width, height }: IVideoPlaceholderProps) {
  return (
    <div className={styles.placeholder} style={{ width, height }}>
      <Logo width={width} height={height} full dontClick />
    </div>
  );
}

export default VideoPlaceholder;
