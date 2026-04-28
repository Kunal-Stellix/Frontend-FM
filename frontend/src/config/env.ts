import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url("NEXT_PUBLIC_API_URL must be a valid URL"),
  NEXT_PUBLIC_TOKEN_REFRESH_BUFFER_SECONDS: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(10),
});

const defaultApiUrl = "http://localhost:8000";

const rawEnv = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl,
  NEXT_PUBLIC_TOKEN_REFRESH_BUFFER_SECONDS:
    process.env.NEXT_PUBLIC_TOKEN_REFRESH_BUFFER_SECONDS,
};

const parsedEnv = envSchema.safeParse(rawEnv);

if (!parsedEnv.success) {
  console.error("Invalid environment variables", parsedEnv.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn(
    `NEXT_PUBLIC_API_URL is not set. Falling back to ${defaultApiUrl} for local development.`,
  );
}

export const env = parsedEnv.data;
