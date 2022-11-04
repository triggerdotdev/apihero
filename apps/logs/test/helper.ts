// This file contains code that we reuse between our tests.
const helper = require("fastify-cli/helper.js");
import * as path from "path";
import * as tap from "tap";
import Fastify from "fastify";

export type Test = typeof tap["Test"]["prototype"];

const AppPath = path.join(__dirname, "..", "src", "app.ts");

// Fill in this config with all the configurations
// needed for testing the application
async function config() {
  return {};
}

// Automatically build and tear down our instance
async function build(t: Test) {
  // you can set all the options supported by the fastify CLI command
  const argv = [AppPath];

  // fastify-plugin ensures that all decorators
  // are exposed for testing purposes, this is
  // different from the production setup
  const app = (await helper.build(argv, await config())) as ReturnType<
    typeof Fastify
  >;

  await app.ready();

  // Tear down our app after we are done
  t.teardown(async () => {
    await app.close();
  });

  return app;
}

export { config, build };
