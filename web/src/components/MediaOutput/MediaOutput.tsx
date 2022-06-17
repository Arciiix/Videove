import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ColorMedia, IMedia, MediaTypes } from "../../types/Media.type";
import Player from "../Feed/Player/Player";

import styles from "./MediaOutput.module.css";

function MediaOutput() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaObj, setMediaObj] = useState<IMedia>();
  const [solidColorMedia, setSolidColorMedia] = useState<string | null>(null);

  const { project, media, width, height } = useParams();

  const getData = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await axios.get("/api/projects/" + project);
      const mediaObj: IMedia = response.data?.project?.media.find(
        (e: IMedia) => e.number.toString() === (media as string).toString()
      );
      if (!mediaObj) {
        setError("Media not found");
        return;
      }
      if ((mediaObj.type as string) === "CUSTOM") {
        setError("Custom media not supported");
        return;
      }
      if ((mediaObj.type as string) === "COLOR") {
        setSolidColorMedia((mediaObj?.media as ColorMedia)?.color);
      }
      setIsLoading(false);
      setMediaObj(mediaObj);
    } catch (err: AxiosError | unknown) {
      if (axios.isAxiosError(err)) {
        if ((err as AxiosError)?.response?.status === 404) {
          setError("Project not found");
        } else {
          setError(
            `Unknown server error ${
              (err as AxiosError)?.response?.status
            }: ${JSON.stringify(err?.response?.data)}`
          );
        }
      } else {
        setError(`Unexpected error`);
      }

      console.error(err);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  if (error)
    return (
      <div className={`${styles.red} ${styles.fullScreen}`}>Error: {error}</div>
    );
  if (isLoading) {
    return (
      <div className={`${styles.black} ${styles.fullScreen}`}>Loading...</div>
    );
  }
  if (!!solidColorMedia) {
    return (
      <div
        className={styles.fullScreen}
        style={{ backgroundColor: solidColorMedia }}
      ></div>
    );
  }
  return (
    <Player
      width={(width as string) + "px"}
      height={(height as string) + "px"}
      media={mediaObj as IMedia}
    />
  );
}

export default MediaOutput;
