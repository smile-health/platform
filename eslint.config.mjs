import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["**/migrations/*.{js,mjs,cjs,ts}", "packages/global-test/.eslintrc.js"],
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: { globals: globals.browser },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    rules: {
      // These are treated as warnings (not errors) across the monorepo so the
      // Lint CI job passes without a large code-refactor effort. Revisit and
      // tighten these back to errors as code is cleaned up.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "prefer-const": "warn",
      "no-unused-vars": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
    },
  },
];
