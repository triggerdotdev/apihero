#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
const yargs = require("yargs");

yargs
  .usage("$0 <cmd> [args]")
  .command(
    "init <publicDir>",
    "Initializes API Hero Service Worker at the specified directory",
    (yargs) => {
      yargs
        .positional("publicDir", {
          type: "string",
          description: "Relative path to the public directory",
          required: true,
          normalize: true,
        })
        .example("init", "apihero-js init public")
        .option("save", {
          type: "boolean",
          description: "Save the worker directory in your package.json",
        });
    },
    require("./init")
  )
  .demandCommand()
  .help().argv;
