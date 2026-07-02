import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, BaseStyles } from "@primer/react";
import App from "./App";
import { AuthProvider } from "./context/authContext";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ThemeProvider colorMode="dark">
        <BaseStyles>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BaseStyles>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);