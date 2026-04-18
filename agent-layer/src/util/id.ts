import { randomBytes } from "node:crypto";

export function newId(prefix: string): string {
  const slug = randomBytes(8).toString("hex");
  return `${prefix}_${slug}`;
}
