import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@core": path.resolve(__dirname, "./src/core"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@layouts": path.resolve(__dirname, "./src/layouts"),
      "@app": path.resolve(__dirname, "./src/app"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            const normalizedId = id.replace(/\\/g, "/");
            const parts = normalizedId.split("node_modules/");
            const pathInNodeModules = parts[parts.length - 1];

            if (
              pathInNodeModules.startsWith("antd/") ||
              pathInNodeModules.startsWith("@ant-design/") ||
              pathInNodeModules.startsWith("@rc-component/") ||
              pathInNodeModules.startsWith("rc-")
            ) {
              return "vendor-antd";
            }

            return "vendor";
          }
        },
      },
    },
  },
});
