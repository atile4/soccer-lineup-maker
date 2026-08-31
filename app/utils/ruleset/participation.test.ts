import { describe, it, expect } from "vitest";
import { Lineup, Player } from "@/app/types";
import { buildParticipation } from "./participation";
import type { PlacementsByLineup } from "@/context/GameLineupContext";

const player = (id: string): Player => ({
  id,
  name: `Player ${id}`,
  number: 1,
  position: "",
  team_id: "team-1",
});

// Four quarters, period-sorted as GameContext provides them.
const LINEUPS: Lineup[] = [0, 1, 2, 3].map((period) => ({
  id: `q${period + 1}`,
  game_id: "game-1",
  period,
  formation: null,
}));

const onField = { x: 50, y: 50, bench: false };
const onBench = { x: null, y: null, bench: true };

describe("buildParticipation", () => {
  it("maps field / bench / sidebar to the three period statuses", () => {
    const placements: PlacementsByLineup = {
      q1: { a: onField },
      q2: { a: onBench },
      q3: {}, // a is in the sidebar
      q4: { a: onField },
    };

    const [a] = buildParticipation([player("a")], LINEUPS, placements);

    expect(a.statuses).toEqual(["field", "bench", "absent", "field"]);
    expect(a.quartersPlayed).toBe(2);
    expect(a.inGame).toBe(true);
  });

  it("marks a player who is never placed as not in the game", () => {
    const placements: PlacementsByLineup = { q1: {}, q2: {}, q3: {}, q4: {} };

    const [a] = buildParticipation([player("a")], LINEUPS, placements);

    expect(a.statuses).toEqual(["absent", "absent", "absent", "absent"]);
    expect(a.quartersPlayed).toBe(0);
    expect(a.inGame).toBe(false);
  });

  it("keeps a player in the game when they sit out only some periods", () => {
    const placements: PlacementsByLineup = {
      q1: {},
      q2: { a: onField },
      q3: { a: onField },
      q4: { a: onField },
    };

    const [a] = buildParticipation([player("a")], LINEUPS, placements);

    expect(a.inGame).toBe(true);
    expect(a.quartersPlayed).toBe(3);
  });

  it("treats a missing lineup entry as absent", () => {
    // q3/q4 haven't been fetched or have no rows at all.
    const placements: PlacementsByLineup = { q1: { a: onField } };

    const [a] = buildParticipation([player("a")], LINEUPS, placements);

    expect(a.statuses).toEqual(["field", "absent", "absent", "absent"]);
  });

  it("orders statuses by the given lineup order, not by lineup id", () => {
    const placements: PlacementsByLineup = {
      q1: {},
      q2: {},
      q3: {},
      q4: { a: onField },
    };

    const [a] = buildParticipation([player("a")], LINEUPS, placements);

    expect(a.statuses.indexOf("field")).toBe(3);
  });
});
