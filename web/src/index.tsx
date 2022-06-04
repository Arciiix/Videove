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
import OBSWebSocket from "obs-websocket-js";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NewProject from "./components/NewProject/NewProject";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const obs = new OBSWebSocket();

root.render(
  <React.StrictMode>
    <RecoilRoot>
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
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home obs={obs} />} />
            <Route path="/newProject" element={<NewProject />} />
            <Route path="app" element={<RequireObsConnected />}>
              <Route path="*" element={<App />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </RecoilRoot>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
