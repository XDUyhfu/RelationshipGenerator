// 引入插件
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import json from "@rollup/plugin-json";
import babel from "@rollup/plugin-babel";
import dts from "rollup-plugin-dts";

// 入口文件
const entry = "index.ts";

// babel配置
const babelOptions = {
    presets: [ "@babel/preset-env" ],
    extensions: [ ".js", ".jsx", ".ts", ".tsx", ".css" ],
    exclude: "**/node_modules/**"
};

// rollup配置
export default [ {
    // 入口
    input: entry,
    // 打包信息
    output: [
        { filname: "index.esm.js", dir: "dist/es/", format: "esm" },
    ],
    // 插件配置
    plugins: [
        // 可使用 `import {module} from './file'` 替换 `import {module} from './file/index.js`
        resolve(),
        // 支持commonjs，包括第三方引入使用到commonjs语法
        commonjs(),
        // typescript支持
        typescript(),
        // 支持读取json文件
        json(),
        // babel
        babel( babelOptions )
    ],
    external: [
        id => /\/__expample__|main.tsx/.test( id ), // 组件的本地测试文件，不希望被打包。
        "react",
        "react-dom",
        "classname",
        "react-is",
        "**/node_modules/**"
    ]
}, {
    input: entry,
    output: [ { filename: "index.d.ts", dir: "dist/es/type", format: "esm" } ],
    plugins: [ dts() ]
} ];