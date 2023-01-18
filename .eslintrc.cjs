module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "overrides": [
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "react",
        "@typescript-eslint"
    ],
    "rules": {
        "eqeqeq": "error",
        "curly": "error",
        "quotes": [ "error", "double" ],
        "semi": [ "error", "always" ],
        "object-curly-newline": [ "error", { "multiline": true } ],
        "block-spacing": "error",
        "arrow-body-style": "error",
        "react/react-in-jsx-scope": "off",
        "@typescript-eslint/no-non-null-assertion": "off"
    }
};
