import { Division, Lineup, Player, SplitBy } from "@/app/types";
import type { PlacementsByLineup } from "@/context/GameLineupContext";
import type { PlayerParticipation } from "./participation";

export type WarningSeverity = "warning" | "error";

// One offending player, for one rule. The warning UI lists these directly —
// one row per violation — so `message` should read as a complete sentence
// about this player, e.g. "Plays all 4 quarters while Bo has played only 2."
export interface RuleViolation {
  ruleId: string;
  playerId: string;
  message: string;
  severity: WarningSeverity;
  // 0-indexed DB periods in which this violation is shown. The modal only
  // lists violations for the period being viewed, so a rule decides where its
  // findings surface: a period-specific rule lists just that period, while a
  // whole-game rule (e.g. a minimum-quarters floor) lists every period.
  periods: number[];
}

// Everything a rule is allowed to look at. Assembled once per evaluation by
// useRulesetEvaluation, so rules stay pure and cheap to unit test.
export interface RulesetContext {
  players: Player[];
  lineups: Lineup[]; // period-sorted
  splitBy: SplitBy;
  division: Division | null;
  participation: PlayerParticipation[];
  placementsByLineup: PlacementsByLineup;
}

export interface Rule {
  id: string;
  label: string;
  // Return [] when the rule passes or does not apply.
  evaluate: (ctx: RulesetContext) => RuleViolation[];
}
