// .prettierrc.js
/** @type {import("prettier").Config} */
const config = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all', // Consistent with modern JS/TS practices
  printWidth: 100, // Balances readability and line length
  tabWidth: 2,
  arrowParens: 'always', // Improves clarity for arrow functions
  // Add other project-specific preferences if absolutely necessary,
  // but lean towards Prettier's defaults for simplicity.
};

module.exports = config;
