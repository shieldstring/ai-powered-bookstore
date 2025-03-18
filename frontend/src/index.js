import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import store from './redux/store';
import { SocketProvider } from "./context/SocketContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
    <SocketProvider>
    <HelmetProvider>
      <App />
    </HelmetProvider>
    </SocketProvider>
    </Provider>
  </React.StrictMode>
);