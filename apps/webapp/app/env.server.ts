import { z } from "zod";

const EnvironmentSchema = z.object({
  MAILGUN_KEY: z.string(),
  SENDGRID_FROM_EMAIL: z.string(),
  MERGENT_KEY: z.string(),
  APP_ORIGIN: z.string().default("https://app.apihero.run"),
  LOGS_ORIGIN: z.string().default("https://logs.apihero.run"),
  LOGS_API_AUTHENTICATION_TOKEN: z.string(),
  PROXY_URL: z.string().default("http://localhost:3000"),
  APIHERO_KEY: z.string(),
});

export type Environment = z.infer<typeof EnvironmentSchema>;

export const env = EnvironmentSchema.parse(process.env);
