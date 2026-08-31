"use client";

import { useMemo } from "react";

import { useGame } from "@/context/GameContext";
import { useGameLineup } from "@/context/GameLineupContext";
import { useLineup } from "@/context/LineupContext";
import { useRulesetWarnings } from "@/context/RulesetWarningsContext";
import { useTeam } from "@/context/TeamContext";
import { buildParticipation } from "@/app/utils/ruleset/participation";
import {
  evaluateRuleset,
  violationsForPeriod,
} from "@/app/utils/ruleset/evaluate";
import type { RuleViolation } from "@/app/utils/ruleset/types";

const NONE: RuleViolation[] = [];

export interface RulesetEvaluation {
  // Violations in the quarter currently being viewed — what the modal lists.
  current: RuleViolation[];
  // Violations in every other quarter, so the modal can point out problems
  // that exist but aren't visible from here.
  elsewhere: RuleViolation[];
  // The period being viewed (0-indexed), or null when there's no active lineup.
  period: number | null;
}

const EMPTY: RulesetEvaluation = {
  current: NONE,
  elsewhere: NONE,
  period: null,
};

// Evaluates the active ruleset against the whole game, then splits the result
// into the quarter being viewed and everything else. Re-runs on every
// placement change, so it is memoized on its inputs.
//
// Yields nothing when the feature is switched off, when there's no active
// game, or when the game isn't split into quarters (see evaluateRuleset).
export function useRulesetEvaluation(): RulesetEvaluation {
  const { enabled } = useRulesetWarnings();
  const { players } = useLineup();
  const { currentGame, lineups } = useGame();
  const { currentTeam } = useTeam();
  const { placementsByLineup } = useGameLineup();

  const currentLineupId = currentGame?.current_lineup_id ?? null;

  return useMemo(() => {
    if (!enabled || !currentGame) return EMPTY;

    const period =
      lineups.find((l) => l.id === currentLineupId)?.period ?? null;
    if (period === null) return EMPTY;

    const all = evaluateRuleset({
      players,
      lineups,
      splitBy: currentGame.split_by,
      division: currentTeam?.division ?? null,
      participation: buildParticipation(players, lineups, placementsByLineup),
      placementsByLineup,
    });

    const current = violationsForPeriod(all, period);
    return {
      current,
      elsewhere: all.filter((v) => !current.includes(v)),
      period,
    };
  }, [
    enabled,
    players,
    lineups,
    currentGame,
    currentLineupId,
    currentTeam?.division,
    placementsByLineup,
  ]);
}
