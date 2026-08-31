// Server-safe constants and helpers for the AYSO ruleset-warnings preference.
// Kept out of RulesetWarningsContext.tsx (a "use client" module) so that server
// components — e.g. app/layout.tsx reading the cookie — can call parseEnabled
// directly. Importing plain functions across a "use client" boundary into a
// server component yields a client reference, not a callable function.
export const COOKIE_NAME = "rulesetWarnings";
export const DEFAULT_ENABLED = false;

// Parse a raw cookie value into a valid flag, falling back to the default.
export function parseEnabled(raw: string | undefined | null): boolean {
  if (raw === "1") return true;
  if (raw === "0") return false;
  return DEFAULT_ENABLED;
}
