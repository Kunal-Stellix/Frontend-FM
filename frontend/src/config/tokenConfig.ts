import { env } from "./env";

export const tokenConfig = {
  /** Seconds before access-token expiry to trigger a proactive refresh. */
  refreshBufferSeconds: env.NEXT_PUBLIC_TOKEN_REFRESH_BUFFER_SECONDS,
} as const;
