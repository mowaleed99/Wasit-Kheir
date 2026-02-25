import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    proxy: {
      "/api": {
        target: "https://wasitkheir.runasp.net",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path, // Keep the /api prefix
        // Critical: Enable cookie handling for cross-origin requests
        cookieDomainRewrite: "localhost",
        cookiePathRewrite: "/",
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("Proxy error:", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Proxying request:", req.method, req.url);
            // Log cookies being sent
            if (req.headers.cookie) {
              console.log("Sending cookies:", req.headers.cookie);
            }
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            // Log cookies being received
            const setCookie = proxyRes.headers["set-cookie"];
            if (setCookie) {
              console.log("Received Set-Cookie headers:", setCookie);
            }
          });
        },
      },
    },
  },
});
