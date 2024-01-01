module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "prettier",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh", "simple-import-sort"],
  rules: {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-debugger": "warn",
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "no-duplicate-imports": "error",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
  },
  overrides: [
    {
      files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
      rules: {
        "simple-import-sort/imports": [
          "error",
          {
            groups: [
              // Packages react related packages, then other packages and packages starting with "@".
              ["^react", "^\\w", "^@?\\w"],
              // Files with alias ~ or @ (root imports).
              ["^@/", "^~"],
              // Parent imports. Put .. last.
              ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
              // Other relative imports. Put same-folder imports and . last.
              ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
              // Side effect imports.
              ["^\\u0000"],
              // Style imports.
              ["^.+\\.?(css|scss)$"],
            ],
          },
        ],
      },
    },
  ],
};
