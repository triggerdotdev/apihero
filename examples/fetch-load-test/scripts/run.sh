# Don't run this script directly, but use it as a reference

# In a separate tab, in <root>/examples/fetch-load-test, run the following command to start the httpbin server:
pnpm run start:bin

# In the root of the repo, run this command to start the proxy server:
pnpm run dev --filter proxy...

# in the root of the repo, run this command to star the logs server:
pnpm run dev --filter ./apps/logs...

# Now in <root>/examples/fetch-load-test, you can run the following command to create a load test:
pnpm run start -n 1 -p hero_123abc --env development --url "http://localhost:8787" -v --bin-url "http://localhost:8080"

# If you want to run more iterations, you can run the following command:
pnpm run start -n 100 -p hero_123abc --env development --url "http://localhost:8787" -v --bin-url "http://localhost:8080"