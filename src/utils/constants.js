import { env } from "~/config/environment"

export const WHITELIST_DOMAINS = [
  // ko cần localhost nữa vì ở file config/cors đã luôn luôn cho phép môi trường dev
  // "http://localhost:5173",
  "https://trello-web-nine-chi.vercel.app",
]

export const BOARD_TYPES = {
  PUBLIC: "public",
  PRIVATE: "private",
}

export const WEBSITE_DOMAIN =
  env.BUILD_MODE === "prod"
    ? env.WEBSITE_DOMANI_PRODUCTION
    : env.WEBSITE_DOMANI_DEVELOPMENT
