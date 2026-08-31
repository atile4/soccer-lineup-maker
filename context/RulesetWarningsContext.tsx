"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
} from "react";

interface RulesetWarningsContextValue {
  enabled: boolean;
  setEnabled: (n: boolean) => void;
}

const RulesetWarningsContext = createContext<
  RulesetWarningsContextValue | undefined
>(undefined);

export function RulesetWarningsProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);

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
