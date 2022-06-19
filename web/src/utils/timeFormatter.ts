import addLeadingZero from "./addLeadingZero";

function secondsTomm_ss_ms(seconds: number): string {
  //Convert seconds to mm:ss:ms (where ms end at 30 (as in most editing software at 30 fps))
  const minutes = Math.floor(seconds / 60);
  const seconds_ = Math.floor(seconds - minutes * 60);
  const milliseconds = Math.floor(parseFloat(seconds.toFixed(3).slice(-3)));

  //Convert milliseconds range 0-1000 to 0-30
  const milliseconds_ = Math.floor((milliseconds * 30) / 1000);

  return `${addLeadingZero(minutes)}:${addLeadingZero(
    seconds_
  )}.${addLeadingZero(milliseconds_)}`;
}

export { secondsTomm_ss_ms };
