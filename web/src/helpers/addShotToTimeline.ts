import { toast } from "react-toastify";
import { SetterOrUpdater } from "recoil";
import { IAddedShot, IShot } from "../types/Shot.type";

async function addShotToTimeline(
  shot: IAddedShot,
  currPosition: number,
  totalLengthSeconds: number,
  setShots: SetterOrUpdater<IShot[]>
) {
  setShots((prevShots) => {
    let newShots = [...prevShots];
    //Take the first shot with the delay higher than the inserted one. Insert the new shot before it.
    let isLast = false;
    let insertShotIndex = prevShots.findIndex(
      (element) => element.delaySeconds > currPosition
    );
    if (insertShotIndex < 0) {
      insertShotIndex = prevShots.length;
      isLast = true;
    }
    console.log("insert shot index", insertShotIndex);

    if (isLast) {
      console.log("IS LAST");
      shot.durationSeconds = totalLengthSeconds - currPosition;
    } else {
      //Calculate the shot duration
      let nextShot = prevShots[insertShotIndex];
      console.log("NEXT", nextShot);
      if (nextShot) {
        console.log("THAT ONE");
        shot.durationSeconds = nextShot.delaySeconds - currPosition;
      } else {
        console.error(`Couldn't find the next shot`);
        toast.error(`Couldn't find the next shot`);
      }
    }

    shot.delaySeconds = currPosition;

    newShots.splice(insertShotIndex, 0, shot as IShot);

    //If the previous shot exists, change its duration to fit the new shot
    let prevShot = newShots[insertShotIndex - 1];
    if (prevShot) {
      newShots[insertShotIndex - 1] = {
        ...newShots[insertShotIndex - 1],
        durationSeconds: currPosition - prevShot.delaySeconds,
      };
    }

    console.log(shot);
    console.log(newShots);

    console.log(`Shot at ${insertShotIndex}`);

    return newShots;
  });
}

export default addShotToTimeline;
