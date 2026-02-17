import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import App from "./App.jsx";

if (typeof window !== "undefined" && typeof window.global === "undefined") {
  window.global = window;
}

const isNativeWebView =
  typeof window !== "undefined" &&
  (window.location.protocol === "capacitor:" ||
    window.location.protocol === "file:" ||
    (window.location.hostname === "localhost" && !window.location.port));

const Router = isNativeWebView ? HashRouter : BrowserRouter;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>
);
