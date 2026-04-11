import "express-session";
import type { User } from "./types.ts";

declare module "express-session" {
  interface SessionData {
    user: User;
  }
}
