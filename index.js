#!/usr/bin/env node

const { program } = require("commander");
const showDefaultMessage = require("./defaultMessage");
const setupReactRouter = require("./boilrs/react-router"); 

// default behavior (when no args)
if (process.argv.length <= 2) {
  showDefaultMessage();
  process.exit(0);
}

program
  .name("boilr")
  .description("Boilerplate generator CLI")
  .version("1.0.0");

program
  .command("react-router-dom")
  .description("Setup React Router boilerplate")
  .action(() => {
    setupReactRouter();
  });

program.parse();
