import { MAX_PLAYERS_BY_DIV } from "@/app/constants/playerLimits";
import type { Rule, RulesetContext, RuleViolation } from "./types";

// ---------------------------------------------------------------------------
// Helpers available to rules
// ---------------------------------------------------------------------------

// Player display name for use inside a message about a *different* player.
// A violation's own row is already labelled with the offender's name/number,
// so messages should only name teammates.
export function nameOf(ctx: RulesetContext, playerId: string): string {
  return ctx.players.find((p) => p.id === playerId)?.name ?? "A teammate";
}

export function joinNames(names: string[]): string {
  if (names.length <= 2) return names.join(" and ");
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

// Every period of the game, for whole-game violations that should surface no
// matter which quarter the coach is looking at.
export function allPeriods(ctx: RulesetContext): number[] {
  return ctx.lineups.map((l) => l.period);
}

// The periods a player is actually on the field, for violations that only make
// sense while looking at a quarter that player features in.
export function fieldedPeriods(
  ctx: RulesetContext,
  playerId: string,
): number[] {
  const participation = ctx.participation.find((p) => p.playerId === playerId);
  if (!participation) return [];
  return ctx.lineups
    .filter((_, i) => participation.statuses[i] === "field")
    .map((l) => l.period);
}

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

// AYSO's "everybody plays" Golden Rule: no player may play all four quarters
// unless every other player in the game has played at least three.
//
// Only players who appear in the game (field or bench in some period) count —
// a player left in the sidebar all game is not on the game roster.
//
// Surfaces in the quarters the over-played player is actually on the field,
// since those are the quarters a coach would edit to fix it.
export const goldenRule: Rule = {
  id: "golden-rule",
  label: "Everybody plays",
  evaluate: (ctx) => {
    const periodCount = ctx.lineups.length;
    const floor = periodCount - 1; // 3 quarters, for a 4-quarter game

    const inGame = ctx.participation.filter((p) => p.inGame);
    const fullGame = inGame.filter((p) => p.quartersPlayed === periodCount);
    if (fullGame.length === 0) return [];

    // Teammates who haven't reached the floor. A player who played every
    // quarter is above the floor and can't be their own blocker.
    const fullGameIds = new Set(fullGame.map((p) => p.playerId));
    const short = inGame.filter(
      (p) => !fullGameIds.has(p.playerId) && p.quartersPlayed < floor,
    );
    if (short.length === 0) return [];

    const blockers = joinNames(short.map((p) => nameOf(ctx, p.playerId)));
    const fewest = Math.min(...short.map((p) => p.quartersPlayed));

    return fullGame.map<RuleViolation>((player) => ({
      ruleId: goldenRule.id,
      playerId: player.playerId,
      severity: "warning",
      message:
        // `Plays all ${periodCount} quarters while ${blockers} ` +
        // `${short.length === 1 ? "has" : "have"} played as few as ${fewest}. ` +
        // `No player may play a full game until every teammate has played ${floor}.`,
        `Plays all ${periodCount} quarters while ${blockers} ` +
        `${short.length === 1 ? "has" : "have"} played as few as ${fewest}. ` +
        `No player may play a full game until every teammate has played ${floor}.`,
      periods: fieldedPeriods(ctx, player.playerId),
    }));
  },
};

// AYSO requires every player in the game to play at least two quarters.
// Only in-game players are checked — someone left in the sidebar all game
// is not on the game roster and is not flagged.
//
// Surfaces in every quarter (whole-game issue) so the coach sees it
// regardless of which period they are editing.
export const minimumQuarters: Rule = {
  id: "minimum-quarters",
  label: "Minimum play time",
  evaluate: (ctx) => {
    const minQuarters = 2;
    const inGame = ctx.participation.filter((p) => p.inGame);
    const short = inGame.filter((p) => p.quartersPlayed < minQuarters);
    if (short.length === 0) return [];

    const periods = allPeriods(ctx);

    return short.map<RuleViolation>((player) => {
      const played = player.quartersPlayed;

      let message: string;
      message =
        `Plays only ${played} quarter${played === 1 ? "" : "s"}. ` +
        `Every player is required to play at least 2 quarters.`;

      return {
        ruleId: minimumQuarters.id,
        playerId: player.playerId,
        severity: "warning",
        message,
        periods,
      };
    });
  },
};

// Sentinel playerId for aggregate violations that aren't tied to one player
// (e.g. too many players on field). The UI suppresses the player name column
// for this value.
export const FIELD_SIZE_PLAYER_ID = "__field-size__";

// AYSO enforces a maximum number of players on the field per division.
// Violations are period-specific — the coach sees which quarter is over limit.
export const maxFieldPlayers: Rule = {
  id: "max-field-players",
  label: "Field size",
  evaluate: (ctx) => {
    if (!ctx.division) return [];
    const limit = MAX_PLAYERS_BY_DIV[ctx.division];
    if (limit === undefined) return [];

    const violations: RuleViolation[] = [];

    for (let i = 0; i < ctx.lineups.length; i++) {
      const lineup = ctx.lineups[i];
      const fielded = ctx.participation.filter(
        (p) => p.statuses[i] === "field",
      );
      if (fielded.length <= limit) continue;

      violations.push({
        ruleId: maxFieldPlayers.id,
        playerId: FIELD_SIZE_PLAYER_ID,
        severity: "warning",
        message:
          `Q${lineup.period + 1} has ${fielded.length} players on field, ` +
          `but ${ctx.division} allows a maximum of ${limit}.`,
        periods: [lineup.period],
      });
    }

    return violations;
  },
};

// The active ruleset. Add rules here as guidelines are defined — the engine
// and the field warning modal pick them up with no other changes.
export const AYSO_RULES: Rule[] = [goldenRule, minimumQuarters, maxFieldPlayers];
