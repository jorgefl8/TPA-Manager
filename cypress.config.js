const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  env: {
    BASE_URL: process.env.BASE_URL || "http://localhost:5173",
    REGISTRY_URL: process.env.REGISTRY_URL || "http://localhost:5400",
    SCOPE_MANAGER_URL: process.env.SCOPE_MANAGER_URL || "http://localhost:5700"
  }
});