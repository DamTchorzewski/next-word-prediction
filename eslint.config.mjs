import js from "@eslint/js";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import { globalIgnores } from "eslint/config";
import pluginVue from "eslint-plugin-vue";
import vueA11y from "eslint-plugin-vuejs-accessibility";
import globals from "globals";

export default defineConfigWithVueTs(
  globalIgnores([
    "dist",
    ".scratch",
    "node_modules",
    "pyTorch",
    "playwright-report",
    "test-results",
  ]),
  js.configs.recommended,
  pluginVue.configs["flat/recommended"],
  vueTsConfigs.recommended,
  // accessibility rules for the templates
  ...vueA11y.configs["flat/recommended"],
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      // a label may wrap its control or point at it with for/id
      "vuejs-accessibility/label-has-for": ["error", { required: { some: ["nesting", "id"] } }],
      // Prettier owns the layout of the templates
      "vue/max-attributes-per-line": "off",
      "vue/singleline-html-element-content-newline": "off",
      "vue/html-self-closing": "off",
      "vue/html-indent": "off",
      "vue/html-closing-bracket-newline": "off",
      "vue/multiline-html-element-content-newline": "off",
    },
  },
);
