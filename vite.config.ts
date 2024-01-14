import path from "path";
import { defineConfig } from "vite";
import { VitePWA, VitePWAOptions } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react-swc";

const pwaConfig: Partial<VitePWAOptions> = {
  devOptions: { enabled: true },
  registerType: "autoUpdate",
  includeAssets: [
    "android-chrome-192x192.png",
    "android-chrome-512x512.png",
    "apple-touch-icon.png",
    "favicon-16x16.png",
    "favicon-32x32.png",
    "favicon.ico",
    "logo.svg",
    "maskable_icon.png",
    "/data/*.json",
  ],
  workbox: {
    globPatterns: ["**/*.{js,css,html,ico,png,svg,json}"],
  },
  manifest: {
    id: "/",
    name: "Proompt",
    short_name: "Proompt",
    description:
      "Proompt is a simple and easy to use prompt generator for your next project.",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/maskable_icon.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/screenshot_welcome.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Welcome screen",
      },
      {
        src: "/screenshot_project.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Project screen",
      },
      {
        src: "/screenshot_welcome_m.png",
        sizes: "720x1280",
        type: "image/png",
        form_factor: "narrow",
        label: "Welcome screen (mobile)",
      },
      {
        src: "/screenshot_project_m.png",
        sizes: "720x1280",
        type: "image/png",
        form_factor: "narrow",
        label: "Project screen (mobile)",
      },
    ],
    theme_color: "#ffffff",
    background_color: "#000",
    display_override: ["window-controls-overlay"],
    display: "standalone",
    scope: "/",
    start_url: "/",
    orientation: "portrait",
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA(pwaConfig)],
  publicDir: "public",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react"],
          "react-dom": ["react-dom"],
        },
      },
    },
  },
});
