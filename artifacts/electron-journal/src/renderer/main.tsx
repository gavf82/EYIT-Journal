import React from "react";
import ReactDOM from "react-dom/client";
import { initFromElectron } from "./store-ipc";
import App from "./App";
import "@/index.css";

async function main() {
  // Load all data from the main process before mounting React,
  // so the in-memory cache is populated when components first render.
  await initFromElectron();

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

main().catch(err => {
  document.body.innerHTML = `<pre style="padding:2rem;color:red">Failed to start: ${String(err)}</pre>`;
  console.error("[EYIT] Fatal startup error:", err);
});
