// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["checker/", "out/", "tmp/", "node_modules/", "eslint.config.mjs"],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json", "./tsconfig.test.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "no-console": "error",
      "no-debugger": "error",
      "no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-extraneous-class": [
        "error",
        { allowStaticOnly: true },
      ],
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/require-array-sort-compare": "error",
    },
  },
);
