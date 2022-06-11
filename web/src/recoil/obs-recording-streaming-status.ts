import { atom } from "recoil";

interface IOBSRecordingStreamingStatus {
  recording: boolean;
  streaming: boolean;
}

const obsRecordingStreamingStatusState = atom<IOBSRecordingStreamingStatus>({
  key: "obs-recording-streaming-status",
  default: {
    recording: false,
    streaming: false,
  },
});

export default obsRecordingStreamingStatusState;
