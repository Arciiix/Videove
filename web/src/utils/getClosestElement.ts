function getClosestElement(arr: number[], number: number): number {
  let closest = arr.find((e) => e >= number) as number;
  if (!closest) {
    closest = arr.reduce((prev, curr) =>
      Math.abs(curr - number) < Math.abs(prev - number) ? curr : prev
    );
  }

  return closest;
}

export default getClosestElement;
