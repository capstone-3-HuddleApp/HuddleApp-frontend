import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: true },

      includeAssets: ["favicon.icon", "apple-touch-icon.png", "mask-icon.svg"],
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^http:\/\/localhost:8000\/api\/.*/,
            handler: "NetworkOnly", // Don't cache API calls—let your in-memory cache handle it
          },
          {
            urlPattern: /^https:\/\/cloudinary\.com\/.*/i,
            handler: "CacheFirst", // Cache Cloudinary images
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
        ],
      },
      manifest: {
        name: "Huddle",
        short_name: "Huddle",
        description: "Find your people, no fee required",
        theme_color: "#f2a451",
        background_color: "#fff9df",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "pwa.svg",
            sizes: "192x192",
            type: "image/svg",
            purpose: "any",
          },
          {
            src: "pwa.svg",
            sizes: "512x512",
            type: "image/svg",
            purpose: "any",
          },
          {
            src: "pwa.svg",
            sizes: "192x192",
            type: "image/svg",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
