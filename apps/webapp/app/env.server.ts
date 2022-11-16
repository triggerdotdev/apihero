import { z } from "zod";

const EnvironmentSchema = z.object({
  MAILGUN_KEY: z.string(),
  SENDGRID_FROM_EMAIL: z.string(),
  MERGENT_KEY: z.string(),
  APP_ORIGIN: z.string().default("https://app.apihero.run"),
});

export type Environment = z.infer<typeof EnvironmentSchema>;

export const env = EnvironmentSchema.parse(process.env);
