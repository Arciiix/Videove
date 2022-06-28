import { IShot } from "../types/Shot.type";

function getNextShotTime(currPosition: number, shots: IShot[]): Date {
  console.log("Trying to get next shot time...");
  let nextShot = [...shots].findIndex((e) => e.delaySeconds > currPosition);

  //If the index has been found
  if (nextShot >= 0) {
    console.log("--NEXT SHOT--");
    console.log(nextShot);
    console.log(shots[nextShot].delaySeconds - currPosition);
    return new Date(
      new Date().getTime() +
        (shots[nextShot].delaySeconds - currPosition) * 1000
    );
  } else {
    console.log("--NEXT SHOT (last)--");
    console.log(
      shots[shots.length - 1].delaySeconds +
        shots[shots.length - 1].durationSeconds -
        currPosition
    );
    return new Date(
      new Date().getTime() +
        (shots[shots.length - 1].delaySeconds +
          shots[shots.length - 1].durationSeconds -
          currPosition) *
          1000
    );
  }

  //   if (currentShot >= 0) {
  //     let nextIndex = currentShot + 1;
  //     if (shots[nextIndex]) {
  //       console.log(shots[nextIndex]);
  //     } else {
  //       console.log(
  //         shots[currentShot].delaySeconds +
  //           shots[currentShot].durationSeconds -
  //           currPosition
  //       );
  //     }
  //   } else {
  //   }
}
export default getNextShotTime;
