import { AYSO_RULES } from "./rules";
import type { Rule, RulesetContext, RuleViolation } from "./types";

// The AYSO ruleset is defined in terms of quarters, so it only applies to
// games split into four periods. Games split by half — or not split at all —
// produce no violations. This is the single gate for that.
export function evaluateRuleset(
  ctx: RulesetContext,
  rules: Rule[] = AYSO_RULES,
): RuleViolation[] {
  if (ctx.splitBy !== "quarter") return [];
  return rules.flatMap((rule) => rule.evaluate(ctx));
}

// Narrow a full-game result to the period currently being viewed.
export function violationsForPeriod(
  violations: RuleViolation[],
  period: number,
): RuleViolation[] {
  return violations.filter((v) => v.periods.includes(period));
}
