import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginJest from "eslint-plugin-jest";
import pluginTest from "eslint-plugin-testing-library";

/** @type {import('eslint').Linter.Config[]} */
export default [
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    files: ["**/*.{js,mjs,cjs,jsx}"]
  },
  {
    languageOptions: {
      globals: globals.browser
    }
  },
  {
    files: ['test/*.test.js'],
    plugins: { jest: pluginJest, "testing-library" : pluginTest },
    languageOptions: {
      globals: pluginJest.environments.globals.globals,
    }
  },
  {
    ignores: [
      "dist/*",
      "node_modules/*"
    ]
  }
];
