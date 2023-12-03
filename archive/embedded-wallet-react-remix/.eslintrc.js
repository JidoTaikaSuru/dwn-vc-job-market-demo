/** @type {import('eslint').Linter.Config} */
module.exports = {
    extends: ["@remix-run/eslint-config",
        "@remix-run/eslint-config/node",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/typescript",
        "prettier"]
};
