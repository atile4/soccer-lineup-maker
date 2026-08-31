"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
import { COOKIE_NAME, DEFAULT_ENABLED } from "./rulesetWarnings";

// Whether AYSO ruleset warnings are surfaced on the field. This is a per-device
// UI preference, not team data — it persists to a browser cookie only, never
// Supabase. Constants and parseEnabled live in ./rulesetWarnings so server
// components can use them (see that file's note); re-exported here for client
// consumers.
export { COOKIE_NAME, DEFAULT_ENABLED, parseEnabled } from "./rulesetWarnings";

interface RulesetWarningsContextValue {
  enabled: boolean;
  setEnabled: (n: boolean) => void;
}

const RulesetWarningsContext = createContext<
  RulesetWarningsContextValue | undefined
>(undefined);

export function RulesetWarningsProvider({
  initialEnabled = DEFAULT_ENABLED,
  children,
}: {
  // Seeded from the cookie on the server (see app/layout.tsx) so the saved
  // preference is correct on first paint — no flash of the wrong state.
  initialEnabled?: boolean;
  children: ReactNode;
}) {
  const [enabled, setEnabledState] = useState<boolean>(initialEnabled);

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
    Cookies.set(COOKIE_NAME, next ? "1" : "0", { expires: 365 });
  }, []);

  return (
    <RulesetWarningsContext.Provider value={{ enabled, setEnabled }}>
      {children}
    </RulesetWarningsContext.Provider>
  );
}

export function useRulesetWarnings() {
  const ctx = useContext(RulesetWarningsContext);
  if (!ctx)
    throw new Error(
      "useRulesetWarnings must be used within a RulesetWarningsProvider",
    );
  return ctx;
}
