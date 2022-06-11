import React from "react";
import OBSWebSocket from "obs-websocket-js";
import obs from "../obs";

const OBSContext = React.createContext<OBSWebSocket>(obs);

export default OBSContext;
