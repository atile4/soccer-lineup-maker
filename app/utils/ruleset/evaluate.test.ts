import { describe, it, expect } from "vitest";
import { Lineup, Player, SplitBy } from "@/app/types";
import { evaluateRuleset, violationsForPeriod } from "./evaluate";
import { buildParticipation } from "./participation";
import type { PlacementsByLineup } from "@/context/GameLineupContext";
import type { RulesetContext } from "./types";

const onField = { x: 50, y: 50, bench: false };
const onBench = { x: null, y: null, bench: true };

// Build a context from a compact spec: player name -> per-period status.
// "F" = field, "B" = bench, "-" = sidebar.
function contextFrom(
  spec: Record<string, string>,
  splitBy: SplitBy = "quarter",
): RulesetContext {
  const periodCount = Object.values(spec)[0].length;
  const lineups: Lineup[] = Array.from({ length: periodCount }, (_, period) => ({
    id: `p${period}`,
    game_id: "game-1",
    period,
    formation: null,
  }));

  const players: Player[] = Object.keys(spec).map((name, i) => ({
    id: name,
    name,
    number: i + 1,
    position: "",
    team_id: "team-1",
  }));

  const placementsByLineup: PlacementsByLineup = {};
  lineups.forEach((lineup, i) => {
    const map: PlacementsByLineup[string] = {};
    for (const [name, row] of Object.entries(spec)) {
      if (row[i] === "F") map[name] = onField;
      else if (row[i] === "B") map[name] = onBench;
    }
    placementsByLineup[lineup.id] = map;
  });

  return {
    players,
    lineups,
    splitBy,
    division: "U-10",
    participation: buildParticipation(players, lineups, placementsByLineup),
    placementsByLineup,
  };
}

describe("evaluateRuleset", () => {
  it("returns nothing for a game that isn't split into quarters", () => {
    // Would otherwise trip the Golden Rule.
    expect(
      evaluateRuleset(contextFrom({ ana: "FF", bo: "BB" }, "half")),
    ).toEqual([]);
    expect(evaluateRuleset(contextFrom({ ana: "F", bo: "B" }, "none"))).toEqual(
      [],
    );
  });

  it("flags a player who plays all four quarters while a teammate has under three", () => {
    const violations = evaluateRuleset(
      contextFrom({ ana: "FFFF", bo: "FFBB", cam: "FFFB" }),
    );

    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatchObject({
      ruleId: "golden-rule",
      playerId: "ana",
      severity: "warning",
    });
    // Names the blocker, but not cam — who is at the 3-quarter floor.
    expect(violations[0].message).toContain("bo");
    expect(violations[0].message).not.toContain("cam");
    // The offender's own name belongs in the row label, not the message.
    expect(violations[0].message).not.toContain("ana");
  });

  it("stays silent when every other in-game player has at least three quarters", () => {
    expect(
      evaluateRuleset(contextFrom({ ana: "FFFF", bo: "FFFB", cam: "FFFF" })),
    ).toEqual([]);
  });

  it("stays silent for the golden rule when nobody plays all four quarters", () => {
    const violations = evaluateRuleset(
      contextFrom({ ana: "FFFB", bo: "BBBB", cam: "FBBB" }),
    );
    expect(violations.filter((v) => v.ruleId === "golden-rule")).toEqual([]);
  });

  it("ignores sidebar-only players — they are not on the game roster", () => {
    // cam never appears, so they can't block ana's full game.
    expect(
      evaluateRuleset(contextFrom({ ana: "FFFF", bo: "FFFB", cam: "----" })),
    ).toEqual([]);
  });

  it("counts a benched quarter as not played, but keeps the player in the game", () => {
    const violations = evaluateRuleset(contextFrom({ ana: "FFFF", bo: "FFBB" }));

    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain("bo");
  });

  it("reports one violation per full-game player", () => {
    const violations = evaluateRuleset(
      contextFrom({ ana: "FFFF", bo: "FFFF", cam: "FBBB" }),
    );

    const golden = violations
      .filter((v) => v.ruleId === "golden-rule")
      .map((v) => v.playerId)
      .sort();
    expect(golden).toEqual(["ana", "bo"]);
  });

  it("runs only the rules it is given", () => {
    const violations = evaluateRuleset(
      contextFrom({ ana: "FFFF", bo: "BBBB" }),
      [{ id: "noop", label: "No-op", evaluate: () => [] }],
    );

    expect(violations).toEqual([]);
  });
});

describe("golden rule period scoping", () => {
  it("surfaces in every quarter the over-played player is on the field", () => {
    const [violation] = evaluateRuleset(
      contextFrom({ ana: "FFFF", bo: "FFBB" }),
    );

    expect(violation.periods).toEqual([0, 1, 2, 3]);
  });
});

describe("minimum-quarters rule", () => {
  it("flags a player who plays only one quarter while teammates play more", () => {
    const violations = evaluateRuleset(
      contextFrom({ ana: "FBBB", bo: "FFFF", cam: "FFFF" }),
    );

    const minViolations = violations.filter(
      (v) => v.ruleId === "minimum-quarters",
    );
    expect(minViolations).toHaveLength(1);
    expect(minViolations[0]).toMatchObject({
      playerId: "ana",
      severity: "warning",
    });
    // Names teammates who have played enough
    expect(minViolations[0].message).toContain("bo");
    expect(minViolations[0].message).toContain("cam");
    // Does not name the offending player in the message
    expect(minViolations[0].message).not.toContain("ana");
  });

  it("flags a player benched the entire game", () => {
    const violations = evaluateRuleset(
      contextFrom({ ana: "FFFF", bo: "BBBB", cam: "FFFF" }),
    );

    const minViolations = violations.filter(
      (v) => v.ruleId === "minimum-quarters",
    );
    expect(minViolations).toHaveLength(1);
    expect(minViolations[0]).toMatchObject({
      playerId: "bo",
      severity: "warning",
    });
    expect(minViolations[0].message).toContain("0 quarters");
  });

  it("stays silent when every in-game player has at least two quarters", () => {
    const violations = evaluateRuleset(
      contextFrom({ ana: "FFFB", bo: "FFFB", cam: "FFFB" }),
    );

    expect(
      violations.filter((v) => v.ruleId === "minimum-quarters"),
    ).toHaveLength(0);
  });

  it("ignores sidebar-only players", () => {
    // dan never appears on field or bench — not in the game.
    const violations = evaluateRuleset(
      contextFrom({ ana: "FFFF", bo: "FFFF", dan: "----" }),
    );

    expect(
      violations.filter((v) => v.ruleId === "minimum-quarters"),
    ).toHaveLength(0);
  });

  it("reports one violation per under-played player", () => {
    const violations = evaluateRuleset(
      contextFrom({ ana: "FBBB", bo: "FBBB", cam: "FFFF" }),
    );

    const minViolations = violations.filter(
      (v) => v.ruleId === "minimum-quarters",
    );
    expect(minViolations.map((v) => v.playerId).sort()).toEqual([
      "ana",
      "bo",
    ]);
  });

  it("omits teammate names when nobody has reached the minimum", () => {
    const violations = evaluateRuleset(
      contextFrom({ ana: "FBBB", bo: "FBBB" }),
    );

    const minViolations = violations.filter(
      (v) => v.ruleId === "minimum-quarters",
    );
    expect(minViolations).toHaveLength(2);
    for (const v of minViolations) {
      expect(v.message).not.toContain("and");
      expect(v.message).toContain("AYSO requires");
    }
  });

  it("uses singular 'quarter' for zero or one quarter played", () => {
    const violations = evaluateRuleset(
      contextFrom({ ana: "FBBB", bo: "BBBB", cam: "FFFF" }),
    );

    const minViolations = violations.filter(
      (v) => v.ruleId === "minimum-quarters",
    );
    const ana = minViolations.find((v) => v.playerId === "ana")!;
    const bo = minViolations.find((v) => v.playerId === "bo")!;

    expect(ana.message).toContain("1 quarter");
    expect(ana.message).not.toContain("1 quarters");
    expect(bo.message).toContain("0 quarters");
  });
});

describe("golden rule + minimum-quarters interaction", () => {
  it("flags both rules independently", () => {
    // ana plays all 4, bo plays only 1 — golden rule for ana and cam,
    // minimum-quarters for bo
    const violations = evaluateRuleset(
      contextFrom({ ana: "FFFF", bo: "FBBB", cam: "FFFF" }),
    );

    const golden = violations.filter((v) => v.ruleId === "golden-rule");
    const min = violations.filter((v) => v.ruleId === "minimum-quarters");

    expect(golden.map((v) => v.playerId).sort()).toEqual(["ana", "cam"]);
    expect(min).toHaveLength(1);
    expect(min[0].playerId).toBe("bo");
  });
});

describe("violationsForPeriod", () => {
  const violations = evaluateRuleset(contextFrom({ ana: "FFFF", bo: "FFBB" }));

  it("returns violations that list the given period", () => {
    expect(violationsForPeriod(violations, 2)).toHaveLength(1);
  });

  it("returns nothing for a period no violation lists", () => {
    expect(violationsForPeriod(violations, 9)).toEqual([]);
  });

  it("filters out violations scoped to other periods only", () => {
    const scoped = [
      { ...violations[0], periods: [1] },
      { ...violations[0], playerId: "bo", periods: [3] },
    ];

    expect(violationsForPeriod(scoped, 1).map((v) => v.playerId)).toEqual([
      "ana",
    ]);
    expect(violationsForPeriod(scoped, 3).map((v) => v.playerId)).toEqual([
      "bo",
    ]);
    expect(violationsForPeriod(scoped, 0)).toEqual([]);
  });
});
