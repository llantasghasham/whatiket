import React from "react";
import ReactDOM from "react-dom";
import AppRouter from "./AppRouter";
import { AuthProvider } from "./context/Auth/AuthContext";

const container = document.getElementById("root");

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </React.StrictMode>,
  container
);

// Finaliza o splash screen se ainda estiver visível
if (typeof window !== "undefined" && typeof window.finishProgress === "function") {
  window.finishProgress();
}
