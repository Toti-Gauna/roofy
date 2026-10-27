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
    ".next-*/**",
    ".lab-shots/**",
    "test-results/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored byte for byte from Kinetic Studio (see components/video/kinetic/PROCEDENCIA.md).
    "components/video/kinetic/*.js",
    ".render/**",
  ]),
]);

export default eslintConfig;
