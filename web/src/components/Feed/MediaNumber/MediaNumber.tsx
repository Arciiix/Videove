import styles from "./MediaNumber.module.css";

interface IMediaNumberProps {
  number: number;
  color: string;
}

function MediaNumber({ number, color }: IMediaNumberProps) {
  return (
    <div className={styles.mediaNumber} style={{ backgroundColor: color }}>
      {number}
    </div>
  );
}
export default MediaNumber;
