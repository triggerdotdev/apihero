# API Hero Logs

Logs API service for API Hero. Logs are stored in Postgres and are created and retrieved using this API.

## Deployment

## Setup Deployment to fly.io

Prior to your first deployment, you'll need to do a few things:

1. Sign up the fly CLI

`fly auth signup`

2. Create two apps on Fly, one for staging and one for production:

```
fly apps create ah-logs
fly regions set mia -a ah-logs
fly apps create ah-logs-staging
fly regions set mia -a ah-logs-staging
```

1. Add a `FLY_API_TOKEN` to your GitHub repo. To do this, go to your user settings on Fly and create a new [token](https://web.fly.io/user/personal_access_tokens/new), then add it to [your repo secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) with the name `FLY_API_TOKEN`.

2. Create a database for both your staging and production environments. Make sure to select the `mia` region and a High-Availability cluster. Run the following:

```sh
fly postgres create --name ah-logs-db
fly pg config update --shared-preload-libraries timescaledb --app ah-logs-db
fly postgres restart --app ah-logs-db
fly postgres attach --app ah-logs ah-logs-db
fly checks list -a ah-logs-db
fly postgres connect -a ah-logs-db -d ah_logs

fly postgres create --name ah-logs-db-stg
fly pg config update --shared-preload-libraries timescaledb --app ah-logs-db-stg
fly postgres restart --app ah-logs-db-stg
fly postgres attach --app ah-logs-staging ah-logs-db-stg
fly checks list -a ah-logs-db-stg
fly postgres connect -a ah-logs-db-stg -d ah_logs_staging
```

> **Note:** You'll get the same warning for the same reason when attaching the staging database that you did in the `fly set secret` step above. No worries. Proceed!

Fly will take care of setting the `DATABASE_URL` secret for you.

5. Set the `API_AUTHENTICATION_TOKEN` secret (this is used as a shared Bearer token so the proxy and webapp can talk to the logs service)

```sh
fly secrets set API_AUTHENTICATION_TOKEN='<staging secret here>' -a ah-logs-staging
fly secrets set API_AUTHENTICATION_TOKEN='<production secret here>' -a ah-logs
```

6. When you push to the `dev` branch it should deploy to `ah-logs-staging`, `main` will deploy to `ah-logs`.

7. At this point, if you'd like to test out the deploying of the app from your local machine, you can run these commands:

```sh
# Deploy staging
fly deploy -e PRIMARY_REGION=mia -a ah-logs-staging --config ./apps/logs/fly.toml --dockerfile ./apps/logs/Dockerfile
# Deploy production
fly deploy -e PRIMARY_REGION=mia -a ah-logs --config ./apps/logs/fly.toml --dockerfile ./apps/logs/Dockerfile
```

# Development

In the project directory, you can run:

### `npm run dev`

To start the app in dev mode.\
Open [http://localhost:3001](http://localhost:3001) to view it in the browser.

### `npm start`

For production mode

### `npm run test`

Run the test cases.

## Learn More

To learn Fastify, check out the [Fastify documentation](https://www.fastify.io/docs/latest/).
