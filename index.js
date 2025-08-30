#!/usr/bin/env node

const { program } = require("commander");
const showDefaultMessage = require("./defaultMessage");
const setupReactRouter = require("./boilrs/react-router");
const setupFirebase = require("./boilrs/firebase");
const { searchNpmPackage } = require("./utils/search");
const { askUserToChoose } = require("./utils/askUser");
const { showReadmes } = require("./utils/readMeFinder");

// Map of supported boilerplates
const boilerplates = {
  "react-router-dom": setupReactRouter,
  "firebase": setupFirebase,
};

// default behavior (when no args)
if (process.argv.length <= 2) {
  showDefaultMessage();
  process.exit(0);
}

program
  .name("boilr")
  .description("Boilerplate generator CLI")
  .version("1.0.0");

// Catch-all command for any package name
program
  .argument("<package>", "package name")
  .action(async (pkgName) => {
    const setupFn = boilerplates[pkgName];
    if (setupFn) {
      // Found a matching boilerplate
      setupFn();
    } else {
      // No boilerplate found → fallback
      console.log(`⚠️  No boilerplate found for "${pkgName}". searching online...`);
      try {
        const result = await searchNpmPackage(pkgName);
        if (result.found) {
          const chosenPkg = await askUserToChoose(result.results);
          console.log(`\n✅ You selected: ${chosenPkg.name}@${chosenPkg.version}`);
          console.log(`\n👉 Now searching README files for ${chosenPkg.name}...`);
          showReadmes(chosenPkg.name);
        } else {
          console.log("❌ No npm packages found.");
        }
      } catch (err) {
        console.error(err);
      }
    }
  });

program.parse();
