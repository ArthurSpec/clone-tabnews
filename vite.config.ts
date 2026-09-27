import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// `npm run build:standalone` gera um único dist/index.html que abre com duplo clique (file://).
export default defineConfig(({ mode }) => ({
  base: "./",
  plugins: [react(), tailwindcss(), ...(mode === "standalone" ? [viteSingleFile()] : [])],
}));
