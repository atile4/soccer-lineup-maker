"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

import { Placement } from "@/app/types";
import { useGame } from "./GameContext";
import { fetchFieldPositionsForLineups } from "@/services/fieldPositions";

// Placements for one lineup, keyed by player_id for O(1) lookups.
export type PlacementMap = Record<string, Placement>;

// Placements for every lineup (period) of the active game, keyed by lineup_id.
export type PlacementsByLineup = Record<string, PlacementMap>;

interface GameLineupContextValue {
  // The single source of truth for placements. LineupContext reads the active
  // period out of this map rather than holding its own copy, so ruleset rules
  // that span the whole game never see stale data mid-drag.
  placementsByLineup: PlacementsByLineup;
  loading: boolean;

  // Local-state write-through, called by LineupContext's optimistic updates.
  // Persistence stays with LineupContext — these only move memory.
  setPlacement: (
    lineupId: string,
    playerId: string,
    next: Placement | null, // null removes the placement (back to the sidebar)
  ) => void;
  setLineupPlacements: (lineupId: string, map: PlacementMap) => void;

  // Drop a player from every period — mirrors the DB's `on delete cascade`
  // when the player row itself is deleted.
  dropPlayer: (playerId: string) => void;
}

const GameLineupContext = createContext<GameLineupContextValue | undefined>(
  undefined,
);

export function GameLineupProvider({ children }: { children: ReactNode }) {
  const { lineups } = useGame();
  const [placementsByLineup, setPlacementsByLineup] =
    useState<PlacementsByLineup>({});
  const [loading, setLoading] = useState(true);

  // Refetch whenever the set of lineups changes — covers switching games and
  // changing split_by (which adds/removes lineup rows). Joined into a stable
  // key so re-renders that hand back an equal array don't refetch.
  const lineupIds = useMemo(() => lineups.map((l) => l.id), [lineups]);
  const lineupKey = lineupIds.join(",");

  useEffect(() => {
    if (lineupIds.length === 0) {
      setPlacementsByLineup({});
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchFieldPositionsForLineups(lineupIds)
      .then((positions) => {
        if (cancelled) return;
        // Seed every lineup so a period with no placements is an empty map
        // rather than undefined.
        const next: PlacementsByLineup = {};
        for (const id of lineupIds) next[id] = {};
        for (const p of positions) {
          (next[p.lineup_id] ??= {})[p.player_id] = {
            x: p.x,
            y: p.y,
            bench: p.bench,
          };
        }
        setPlacementsByLineup(next);
      })
      .catch((err) =>
        console.error("Failed to load game placements:", err),
      )
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // lineupKey stands in for lineupIds — see the note above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineupKey]);

  const setPlacement = useCallback(
    (lineupId: string, playerId: string, next: Placement | null) => {
      setPlacementsByLineup((prev) => {
        const lineup = prev[lineupId] ?? {};
        if (next === null) {
          if (!(playerId in lineup)) return prev;
          const updated = { ...lineup };
          delete updated[playerId];
          return { ...prev, [lineupId]: updated };
        }
        return { ...prev, [lineupId]: { ...lineup, [playerId]: next } };
      });
    },
    [],
  );

  const setLineupPlacements = useCallback(
    (lineupId: string, map: PlacementMap) => {
      setPlacementsByLineup((prev) => ({ ...prev, [lineupId]: map }));
    },
    [],
  );

  const dropPlayer = useCallback((playerId: string) => {
    setPlacementsByLineup((prev) => {
      let changed = false;
      const next: PlacementsByLineup = {};
      for (const [lineupId, map] of Object.entries(prev)) {
        if (playerId in map) {
          const updated = { ...map };
          delete updated[playerId];
          next[lineupId] = updated;
          changed = true;
        } else {
          next[lineupId] = map;
        }
      }
      return changed ? next : prev;
    });
  }, []);

  return (
    <GameLineupContext.Provider
      value={{
        placementsByLineup,
        loading,
        setPlacement,
        setLineupPlacements,
        dropPlayer,
      }}
    >
      {children}
    </GameLineupContext.Provider>
  );
}

export function useGameLineup() {
  const ctx = useContext(GameLineupContext);
  if (!ctx)
    throw new Error("useGameLineup must be used within a GameLineupProvider");
  return ctx;
}
