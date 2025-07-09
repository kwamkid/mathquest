import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // ลด strict level ของ warnings
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
          // อนุญาติ destructured variables ที่ไม่ใช้
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      "react-hooks/exhaustive-deps": "warn",
      "prefer-const": "warn",
      "@next/next/no-img-element": "warn",

      // อนุญาติให้ใช้ dynamic imports
      "@typescript-eslint/no-var-requires": "off",

      // ลดความเข้มงวดสำหรับ unused parameters
      "@typescript-eslint/no-unused-parameters": "off",

      // อนุญาติให้ใช้ any ในบางกรณี
      "@typescript-eslint/ban-ts-comment": "warn",

      // ลดความเข้มงวดสำหรับ empty functions
      "@typescript-eslint/no-empty-function": "warn",

      // อนุญาติให้ประกาศตัวแปรแล้วไม่ใช้ (สำหรับ development)
      "no-unused-vars": "off", // ปิดเพื่อใช้ TypeScript version
    },
  },
  {
    // กำหนด globals สำหรับ canvas-confetti และ browser APIs
    languageOptions: {
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        console: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",

        // Node.js globals (สำหรับ build process)
        process: "readonly",
        Buffer: "readonly",
        global: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
      },
    },
  },
  {
    // Ignore patterns สำหรับไฟล์ที่ไม่ต้องการตรวจสอบ
    ignores: [
      ".next/**/*",
      "out/**/*",
      "build/**/*",
      "node_modules/**/*",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
      "postcss.config.js",
      // Ignore declaration files
      "**/*.d.ts",
      // Ignore test files if any
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
    ],
  },
];

export default eslintConfig;
