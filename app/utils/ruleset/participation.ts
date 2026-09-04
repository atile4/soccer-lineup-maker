import { Lineup, Player } from "@/app/types";
import type { PlacementsByLineup } from "@/context/GameLineupContext";

// What a player was doing in a single quarter.
//   field  — placed on the pitch: this period counts as played.
//   bench  — in the game, but did not play this quarter.
//   absent — still in the sidebar: not part of the game for this period.
export type PeriodStatus = "field" | "bench" | "absent";

export interface PlayerParticipation {
  playerId: string;
  // Indexed by position in the period-sorted `lineups` array, so statuses[0]
  // is the first quarter (DB period 0 — "Q1").
  statuses: PeriodStatus[];
  quartersPlayed: number; // count of "field"
  // A player is in the game if they appear (field or bench) in any quarter.
  // Players who sit in the sidebar all game are not on the game roster and
  // considered absent.
  inGame: boolean;
}

export function buildParticipation(
  players: Player[],
  lineups: Lineup[],
  placementsByLineup: PlacementsByLineup,
): PlayerParticipation[] {
  return players.map((player) => {
    const statuses: PeriodStatus[] = lineups.map((lineup) => {
      const placement = placementsByLineup[lineup.id]?.[player.id];
      if (!placement) return "absent";
      return placement.bench ? "bench" : "field";
    });

    return {
      playerId: player.id,
      statuses,
      quartersPlayed: statuses.filter((s) => s === "field").length,
      inGame: statuses.some((s) => s !== "absent"),
    };
  });
}
