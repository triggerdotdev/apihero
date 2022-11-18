# API Hero Proxy

A Cloudflare Worker powered proxy server for API Hero.

## Deployment

You'll need to first install the workspace dependencies to get access to the `wrangler` cli:

```sh
# Run this from the monorepo root
pnpm install
```

Then, move into the `proxy` directory:

```sh
cd ./apps/proxy
```

And make sure you are logged in to Cloudflare with wrangler:

```sh
wrangler login
```

### Staging

1. Add the `LOGS_AUTHENTICATION_TOKEN` secret to the staging env:

```sh
pnpm exec wrangler secret put LOGS_AUTHENTICATION_TOKEN --env staging
```

2. Ensure the `LOGS_URL` env var is set correctly in the wrangler.toml file:

```toml
[env.staging.vars]
LOGS_URL = "https://ah-logs-staging.fly.dev"
```

3. Deploy to Cloudflare:

```sh
pnpm exec wrangler publish --env=staging
```

### Production

1. Add the `LOGS_AUTHENTICATION_TOKEN` secret to the production env:

```sh
pnpm exec wrangler secret put LOGS_AUTHENTICATION_TOKEN --env production
```

2. Ensure the `LOGS_URL` env var is set correctly in the wrangler.toml file:

```toml
[env.production.vars]
LOGS_URL = "https://logs.apihero.run"
```

3. Deploy to Cloudflare:

```sh
pnpm exec wrangler publish --env=production
```
