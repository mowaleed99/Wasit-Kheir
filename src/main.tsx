import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./utils/consoleErrorHandler";
import "leaflet/dist/leaflet.css"; // Import Leaflet CSS globally
import { registerSW } from "virtual:pwa-register";

// Register service worker for PWA (enables offline + iPhone install)
registerSW({
  onNeedRefresh() {
    // New content available, will update on next visit
  },
  onOfflineReady() {
    console.log("App is ready to work offline");
  },
});

console.log("Starting application...");

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  console.log("Root element found, rendering app...");

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  console.log("App rendered successfully");
} catch (error) {
  console.error("Failed to render app:", error);
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial;">
        <h1>Application Error</h1>
        <p>Failed to initialize the application.</p>
        <pre>${error}</pre>
        <p>Check the browser console for more details.</p>
      </div>
    `;
  }
}
