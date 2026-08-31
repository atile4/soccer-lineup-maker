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

import { Player } from "@/app/types";
import { fetchPlayers } from "@/services/players";
import {
  placePlayerOnField,
  benchPlayer,
  removeFieldPosition,
  benchAllPlayers,
} from "@/services/fieldPositions";
import { useGameLineup, type PlacementMap } from "./GameLineupContext";

// Stable identity for "this lineup has no placements", so the derived-buckets
// memo below doesn't rerun on every render when a period is empty.
const EMPTY_PLACEMENTS: PlacementMap = Object.freeze({});

interface LineupContextValue {
  players: Player[];
  loading: boolean;

  // Derived player buckets for each surface.
  unplacedPlayers: Player[]; // sidebar
  benchedPlayers: Player[]; // bench
  fieldedPlayers: Player[]; // field

  // Coordinates for on-field players, keyed by player_id.
  placements: PlacementMap;

  // Mutations — each updates local state optimistically, then persists.
  placeOnField: (playerId: string, x: number, y: number) => void;
  placeOnBench: (playerId: string) => void;
  unplace: (playerId: string) => void;
  benchAll: () => void;

  // Reflect an edited player (name/position/etc.) back into the roster so
  // every surface — sidebar, bench, field — shows the new info. Persistence
  // is handled by whoever performed the edit (e.g. the info popover).
  applyPlayerUpdate: (updated: Player) => void;

  // Drop a deleted player out of the roster (and any placement) so they
  // disappear from every surface. Persistence is handled by the caller
  // (the info popover deletes the DB row before calling this).
  removePlayer: (playerId: string) => void;

  // Add a newly-created player to the roster. The caller is responsible
  // for persisting to the DB first; this only updates local state.
  addPlayer: (player: Player) => void;
}

const LineupContext = createContext<LineupContextValue | undefined>(undefined);

interface LineupProviderProps {
  teamId: string | null;
  lineupId: string | null;
  children: ReactNode;
}

export function LineupProvider({
  teamId,
  lineupId,
  children,
}: LineupProviderProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [rosterLoading, setRosterLoading] = useState(true);

  // Placements live in GameLineupContext, which holds every period of the
  // active game. This provider reads the active period out of that map and
  // writes back through it, so there is only ever one copy of the data.
  const {
    placementsByLineup,
    loading: placementsLoading,
    setPlacement,
    setLineupPlacements,
    dropPlayer,
  } = useGameLineup();

  const placements = lineupId
    ? (placementsByLineup[lineupId] ?? EMPTY_PLACEMENTS)
    : EMPTY_PLACEMENTS;

  // Load the roster for the active team.
  useEffect(() => {
    if (!teamId) {
      setPlayers([]);
      setRosterLoading(false); // nothing to load — no team selected
      return;
    }

    let cancelled = false;
    setRosterLoading(true);

    fetchPlayers(teamId)
      .then((playerData) => {
        if (!cancelled) setPlayers(playerData);
      })
      .catch((err) => console.error("Failed to load lineup data:", err))
      .finally(() => {
        if (!cancelled) setRosterLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [teamId]);

  // Without a game there's no valid lineup FK, and placements are keyed by
  // lineup — so there's nowhere to put the change. Drop it with a warning.
  // @TODO Remove this guard once a lineup always exists for the active game.
  const warnNoLineup = () =>
    console.warn(
      "No active lineup — change ignored. " +
        "This resolves once a game/lineup is selected.",
    );

  const placeOnField = useCallback(
    (playerId: string, x: number, y: number) => {
      if (!lineupId) return warnNoLineup();
      setPlacement(lineupId, playerId, { x, y, bench: false });
      placePlayerOnField(lineupId, playerId, x, y).catch((err) =>
        console.error("Failed to persist field placement:", err),
      );
    },
    [lineupId, setPlacement],
  );

  const placeOnBench = useCallback(
    (playerId: string) => {
      if (!lineupId) return warnNoLineup();
      setPlacement(lineupId, playerId, { x: null, y: null, bench: true });
      benchPlayer(lineupId, playerId).catch((err) =>
        console.error("Failed to persist bench placement:", err),
      );
    },
    [lineupId, setPlacement],
  );

  const unplace = useCallback(
    (playerId: string) => {
      if (!lineupId) return warnNoLineup();
      setPlacement(lineupId, playerId, null);
      removeFieldPosition(lineupId, playerId).catch((err) =>
        console.error("Failed to remove field placement:", err),
      );
    },
    [lineupId, setPlacement],
  );

  const benchAll = useCallback(() => {
    if (!lineupId) return warnNoLineup();
    const ids = players.map((p) => p.id);
    const next: PlacementMap = {};
    for (const id of ids) next[id] = { x: null, y: null, bench: true };
    setLineupPlacements(lineupId, next);
    benchAllPlayers(lineupId, ids).catch((err) =>
      console.error("Failed to bench all players:", err),
    );
  }, [players, lineupId, setLineupPlacements]);

  const applyPlayerUpdate = useCallback((updated: Player) => {
    setPlayers((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  const removePlayer = useCallback(
    (playerId: string) => {
      setPlayers((prev) => prev.filter((p) => p.id !== playerId));
      // The DB cascades the delete across every lineup, so clear them all.
      dropPlayer(playerId);
    },
    [dropPlayer],
  );

  const addPlayer = useCallback((player: Player) => {
    setPlayers((prev) => [...prev, player]);
  }, []);

  const { unplacedPlayers, benchedPlayers, fieldedPlayers } = useMemo(() => {
    const unplaced: Player[] = [];
    const benched: Player[] = [];
    const fielded: Player[] = [];
    for (const player of players) {
      const placement = placements[player.id];
      if (!placement) unplaced.push(player);
      else if (placement.bench) benched.push(player);
      else fielded.push(player);
    }
    return {
      unplacedPlayers: unplaced,
      benchedPlayers: benched,
      fieldedPlayers: fielded,
    };
  }, [players, placements]);

  const value: LineupContextValue = {
    players,
    loading: rosterLoading || placementsLoading,
    unplacedPlayers,
    benchedPlayers,
    fieldedPlayers,
    placements,
    placeOnField,
    placeOnBench,
    unplace,
    benchAll,
    applyPlayerUpdate,
    removePlayer,
    addPlayer,
  };

  return (
    <LineupContext.Provider value={value}>{children}</LineupContext.Provider>
  );
}

export function useLineup() {
  const ctx = useContext(LineupContext);
  if (!ctx) throw new Error("useLineup must be used within a LineupProvider");
  return ctx;
}
