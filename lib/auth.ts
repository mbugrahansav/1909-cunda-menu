import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "cunda_admin";
const maxAge = 60 * 60 * 24 * 7;

function secret() { return process.env.SESSION_SECRET || "dev-only-change-this-secret"; }
function signature(value: string) { return createHmac("sha256", secret()).update(value).digest("hex"); }

export function passwordMatches(value: string) {
  const expected = Buffer.from(process.env.ADMIN_PASSWORD || "1909cunda");
  const received = Buffer.from(value);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function createSession() {
  const expires = String(Date.now() + maxAge * 1000);
  (await cookies()).set(COOKIE_NAME, `${expires}.${signature(expires)}`, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge });
}

export async function destroySession() { (await cookies()).delete(COOKIE_NAME); }

export async function isAuthenticated() {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  if (!value) return false;
  const [expires, provided] = value.split(".");
  if (!expires || !provided || Number(expires) < Date.now()) return false;
  const expected = signature(expires);
  return expected.length === provided.length && timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
}
