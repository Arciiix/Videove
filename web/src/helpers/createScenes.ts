import OBSWebSocket from "obs-websocket-js";
import { toast } from "react-toastify";
import { IMedia } from "../types/Media.type";

async function createScenes(
  obs: OBSWebSocket,
  projectName: string,
  projectId: string,
  media: IMedia[]
): Promise<void> {
  console.log("-- Creating scenes --");
  const baseUrl = `${window.location.protocol}//${window.location.host}`;

  const videoSettings = await obs.call("GetVideoSettings");
  console.log(
    `OBS output: ${videoSettings.outputWidth}x${videoSettings.outputHeight} (${videoSettings.baseWidth}x${videoSettings.baseHeight})`
  );

  const sceneCollectionName = `Videove - ${projectName}-${projectId}`;
  const sceneCollection = await obs.call("GetSceneCollectionList");

  //Check if the scene colleciton exists
  if (sceneCollection.sceneCollections.find((e) => e === sceneCollectionName)) {
    toast.warning("Scene collection already exists - delete it first");
    return;
  }

  //Create a new scene collection
  const createSceneCollection = await obs.call("CreateSceneCollection", {
    sceneCollectionName,
  });
  console.log(createSceneCollection);
  const setCurrentSceneCollection = await obs.call(
    "SetCurrentSceneCollection",
    {
      sceneCollectionName,
    }
  );
  console.log(setCurrentSceneCollection);

  //Create blank scene
  await obs.call("CreateScene", {
    sceneName: "0_VideoveBlank",
  });

  await obs.call("CreateInput", {
    sceneName: "0_VideoveBlank",
    inputKind: "wasapi_output_capture",
    inputName: "AudioOutput",
  });

  //Create the logo
  const createLogo = await obs.call("CreateInput", {
    sceneName: "0_VideoveBlank",
    inputName: "VideoveLogo",
    inputKind: "browser_source",
    inputSettings: {
      url: `${baseUrl}/output/logo`,
      width: 300,
      height: 200,
    },
  });
  await obs.call("SetSceneItemTransform", {
    sceneName: "0_VideoveBlank",
    sceneItemId: createLogo.sceneItemId,
    sceneItemTransform: {
      positionX: 30,
      positionY: videoSettings.baseHeight - 150,
    },
  });

  console.log("Creating scenes and sources...");
  //Create the scenes and the sources
  for await (const m of media) {
    const sceneName = m.number.toString();
    const sceneItemName = `VideoveFeed${m.number}`;

    const createScene = await obs.call("CreateScene", {
      sceneName,
    });
    console.log(createScene);

    await obs.call("SetCurrentProgramScene", {
      sceneName,
    });

    const transitionChange = await obs.call("SetCurrentSceneTransition", {
      transitionName: "Cut",
    });
    console.log(transitionChange);

    //Audio
    await obs.call("CreateSceneItem", {
      sceneName,
      sourceName: "AudioOutput",
      sceneItemEnabled: true,
    });

    if ((m.type as string) !== "CUSTOM" && (m.type as string) !== "AUDIO") {
      const createInput = await obs.call("CreateInput", {
        sceneName,
        inputName: sceneItemName,
        inputKind: "browser_source",
        inputSettings: {
          url: `${baseUrl}/output/${projectId}/${m.number}/${videoSettings.outputWidth}/${videoSettings.outputHeight}`,
          width: videoSettings.outputWidth,
          height: videoSettings.outputHeight,
        },
      });
      console.log(createInput);

      await obs.call("SetSceneItemTransform", {
        sceneName,
        sceneItemId: createInput.sceneItemId,
        sceneItemTransform: {
          boundsType: "OBS_BOUNDS_STRETCH",
          boundsWidth: videoSettings.baseWidth,
          boundsHeight: videoSettings.baseHeight,
        },
      });
    }
    //Logo
    const createLogo = await obs.call("CreateSceneItem", {
      sceneName,
      sourceName: "VideoveLogo",
      sceneItemEnabled: true,
    });
    await obs.call("SetSceneItemTransform", {
      sceneName,
      sceneItemId: createLogo.sceneItemId,
      sceneItemTransform: {
        positionX: 30,
        positionY: videoSettings.baseHeight - 150,
      },
    });
  }

  toast.success("Created the OBS scenes!");
}

export default createScenes;
