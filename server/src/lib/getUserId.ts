import type { Request } from "express";

export function getUserId(req: Request): string {
  // 1. Logged-in user
  if (req.identity?.type === "user") {
    return `user:${req.identity.id}`;
  }

  console.log("IDENTITY:", req.identity);
  console.log("HEADERS:", req.headers.authorization);

  // 2. Safe header handling
  const header = req.headers["x-anonymous-id"];

  const anonId = Array.isArray(header) ? header[0] : header?.toString() || req.identity?.id;

  return `guest:${anonId}`;
}
