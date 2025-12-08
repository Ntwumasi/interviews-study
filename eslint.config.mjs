import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Custom rules
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // Allow any in specific cases - will fix incrementally
      "@typescript-eslint/no-explicit-any": "warn",
      // Unused vars are warnings, not errors
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      }],
      // Allow setState in effects for initialization patterns
      "react-hooks/set-state-in-effect": "off",
      // Allow accessing variables before declaration in certain patterns
      "react-hooks/immutability": "off",
    },
  },
  // Test files can be more relaxed
  {
    files: ["**/__tests__/**/*", "**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // Scripts can be more relaxed
  {
    files: ["scripts/**/*"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
]);

export default eslintConfig;
