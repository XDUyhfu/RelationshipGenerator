import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
    plugins: [
        dts({
            exclude: "vite.config.ts",
            rollupTypes: true,
            copyDtsFiles: true,
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "ReGen",
            fileName: "re-gen",
        },
    },
});
