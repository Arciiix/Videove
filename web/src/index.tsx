import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./components/App/App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@emotion/react";
import { createTheme, CssBaseline } from "@mui/material";
import Home from "./components/Home/Home";
import { RecoilRoot } from "recoil";
import RequireObsConnected from "./helpers/RequireObsConnected";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NewProject from "./components/NewProject/NewProject";
import ConfirmationDialogProvider from "./components/ConfirmationDialog/ConfirmContext";
import OBSContext from "./context/OBS.context";
import obs from "./obs";
import MediaOutput from "./components/MediaOutput/MediaOutput";
import EditProject from "./components/EditProject/EditProject";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  // <React.StrictMode>
  <RecoilRoot>
    <OBSContext.Provider value={obs}>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          theme="dark"
        />
        <ConfirmationDialogProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/newProject" element={<NewProject />} />
              <Route path="/editProject/:project" element={<EditProject />} />
              <Route path="app" element={<RequireObsConnected />}>
                <Route path=":id" element={<App />} />
              </Route>
              <Route path="output">
                <Route path=":project">
                  <Route
                    path=":media/:width/:height"
                    element={<MediaOutput />}
                  ></Route>
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </ConfirmationDialogProvider>
      </ThemeProvider>
    </OBSContext.Provider>
  </RecoilRoot>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
