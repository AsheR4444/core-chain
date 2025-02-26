import pluginJs from "@eslint/js"
import pluginImport from "eslint-plugin-import"
import pluginSimpleImportSort from "eslint-plugin-simple-import-sort"
import pluginUnusedImports from "eslint-plugin-unused-imports"
import globals from "globals"
import tseslint from "typescript-eslint"

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["node_modules/**"], // Исключаем папку node_modules
  },
  {
    plugins: {
      import: pluginImport,
      "simple-import-sort": pluginSimpleImportSort,
      "unused-imports": pluginUnusedImports,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      // Базовое форматирование
      semi: ["error", "never"], // Отключаем точки с запятой
      indent: ["error", 2], // Устанавливаем отступы в 2 пробела
      quotes: ["error", "double"], // Используем двойные кавычки
      "comma-dangle": ["error", "always-multiline"], // Запятая в конце многострочных конструкций
      "eol-last": ["error", "always"], // Пустая строка в конце файла
      "no-trailing-spaces": "error", // Убираем пробелы в конце строк
      "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 0, "maxBOF": 0 }],

      // Пробелы и отступы
      "object-curly-spacing": ["error", "always"], // Пробелы внутри фигурных скобок
      "array-bracket-spacing": ["error", "never"], // Пробелы внутри квадратных скобок
      "computed-property-spacing": ["error", "never"], // Пробелы внутри вычисляемых свойств
      "space-in-parens": ["error", "never"], // Пробелы внутри круглых скобок
      "space-before-blocks": "error", // Пробел перед блоками
      "space-before-function-paren": ["error", {
        anonymous: "never",
        named: "never",
        asyncArrow: "always",
      }], // Пробелы перед скобками функций
      "keyword-spacing": ["error", { before: true, after: true }], // Пробелы вокруг ключевых слов

      // TypeScript
      "@typescript-eslint/no-unused-vars": ["warn", {
        "vars": "all",
        "args": "after-used",
        "ignoreRestSiblings": true,
        "varsIgnorePattern": "^_",
        "argsIgnorePattern": "^_",
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-non-null-assertion": "off",

      // Import rules
      "import/no-unresolved": "error",
      "import/named": "error",
      "import/default": "error",
      "import/namespace": "error",
      "import/no-named-as-default": "warn",
      "import/no-named-as-default-member": "warn",
      "import/no-duplicates": "warn",
      "import/no-unused-modules": "off",
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-absolute-path": "error",
      "import/no-cycle": "warn",
      "import/no-useless-path-segments": "error",
      "import/no-deprecated": "warn",
      "import/no-extraneous-dependencies": "warn",
      "import/extensions": ["error", "never"],
      "import/order": "off",
      "import/prefer-default-export": "off",
      "import/no-mutable-exports": "error",

      // Unused imports
      "no-unused-vars": "off", // Turned off as it's handled by typescript-eslint
      "@typescript-eslint/no-unused-vars": ["warn", {
        "vars": "all",
        "args": "after-used",
        "ignoreRestSiblings": true,
        "varsIgnorePattern": "^_",
        "argsIgnorePattern": "^_",
      }],
      "unused-imports/no-unused-imports": "off", // Отключаем автоудаление
      "unused-imports/no-unused-vars": ["warn", {
        "vars": "all",
        "varsIgnorePattern": "^_",
        "args": "after-used",
        "argsIgnorePattern": "^_",
      }],

      // Simple Import Sort
      "simple-import-sort/imports": ["error", {
        "groups": [
          // Node.js builtins
          ["^node:"],
          // Packages
          ["^@?\\w"],
          // Internal packages
          ["^@/"],
          // Parent imports
          ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
          // Other relative imports
          ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
          // Style imports
          ["^.+\\.s?css$"],
        ],
      }],
      "simple-import-sort/exports": "error",
    },
    languageOptions: {
      ecmaVersion: "latest", // Поддержка последних стандартов JS
      sourceType: "module",  // Поддержка ESM
    },
    linterOptions: {
      reportUnusedDisableDirectives: true, // Отчёт о неиспользуемых директивах
    },
  },
]
