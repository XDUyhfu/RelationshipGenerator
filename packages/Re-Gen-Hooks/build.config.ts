import { defineBuildConfig } from "unbuild";

export default defineBuildConfig( {
    entries: [
        "src/hooks/index"
    ],
    declaration: true,
    rollup: {emitCJS: true}
} );