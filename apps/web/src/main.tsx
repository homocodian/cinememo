import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router";

import App from "./App";
import "./index.css";

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <Router
      future={{
        v7_relativeSplatPath: true
      }}
    >
      <App />
    </Router>
  </React.StrictMode>
);
