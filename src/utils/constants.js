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

console.log(env.BUILD_MODE)
export const WEBSITE_DOMAIN =
  env.BUILD_MODE === "prod"
    ? env.WEBSITE_DOMANI_PRODUCTION
    
    : env.WEBSITE_DOMANI_DEVELOPMENT

export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 12

export const INVITATION_TYPES = {
  BOARD_INVITATION: "BOARD_INVITATION",
}

export const BOARD_INVITATION_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
}

export const CARD_MEMBER_ACTIONS = {
  ADD: "ADD",
  REMOVE: "REMOVE",
}
