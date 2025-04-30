import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Twirrewyn Checklist",
        short_name: "Twirrewyn",
        start_url: ".",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#3498db",
        description: "A checklist and notes app for Twirrewyn.",
        icons: [
          {
            src: "/vite.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "/vite.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
        ],
      },
    }),
  ],
  base: process.env.NODE_ENV === "production" ? "/Twirrewyn/" : "/",
});
