import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), dts()],
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            formats: ["es", "umd"],
            name: "ReComponent",
        },
        rollupOptions: {
            external: ["react"],
            output: { globals: { react: "React" } },
        },
    },
});
