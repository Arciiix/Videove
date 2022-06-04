import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useRecoilValue } from "recoil";
import obsStatusState from "../recoil/obs-status";

function RequireObsConnected() {
  const obsStatus = useRecoilValue(obsStatusState);

  if (!obsStatus) {
    return <Navigate to="/" replace />;
  } else {
    return <Outlet />;
  }
}

export default RequireObsConnected;
