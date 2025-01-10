import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const rootElement = document.createElement("div");
rootElement.id = "justweb3-extension-root";
document.body.appendChild(rootElement);

const root = ReactDOM.createRoot(rootElement);
root.render(<App />);

