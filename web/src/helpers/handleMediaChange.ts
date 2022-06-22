import OBSWebSocket from "obs-websocket-js";

async function handleMediaChange(
  obs: OBSWebSocket,
  currMedia: string
): Promise<void> {
  await obs.call("SetCurrentProgramScene", {
    sceneName: currMedia.toString(),
  });
}
export default handleMediaChange;
