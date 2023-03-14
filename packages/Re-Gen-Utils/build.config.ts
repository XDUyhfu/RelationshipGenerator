import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
    entries: ["src/utils/index"],
    declaration: true,
    rollup: { emitCJS: true },
});
