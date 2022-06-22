import { SetStateAction } from "react";

async function getState<T>(
  setter: React.Dispatch<SetStateAction<T>>
): Promise<T> {
  const result: T = await new Promise((resolve, reject) => {
    setter((prev: T) => {
      resolve(prev);
      return prev;
    });
  });

  return result;
}

export default getState;
