// This file contains code that we reuse between our tests.
import Fastify from "fastify";
import fp from "fastify-plugin";
import { app as mainApp } from "../src/app";
import * as tap from "tap";

export type Test = typeof tap["Test"]["prototype"];

// Automatically build and tear down our instance
async function build(t: Test) {
  // fastify-plugin ensures that all decorators
  // are exposed for testing purposes, this is
  // different from the production setup

  const app = Fastify();

  t.before(async () => {
    void app.register(fp(mainApp));
    await app.ready();
  });

  // Tear down our app after we are done
  t.teardown(() => app.close());

  return app;
}

export { build };
