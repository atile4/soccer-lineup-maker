export interface Player {
  id: string;
  name: string;
  number: number | null;
  position: string;
  team_id: string;
}

export interface Team {
  id: string;
  name: string;
  division: Division | null;
  gender: Gender;
  color: string;
}

// includes player count, which is not a column in the teams table
export interface TeamWithPlayerCount extends Team {
  playerCount: number;
}

export interface Game {
  id: string;
  team_id: string;
  name: string;
  split_by: SplitBy;
  notes: string;
  current_lineup_id: string | null;
}

export interface Lineup {
  id: string;
  game_id: string;
  period: number;
  formation: string | null;
}

export interface FieldPosition {
  id: string;
  lineup_id: string;
  player_id: string;
  x: number | null; // percentage from left, 0-100
  y: number | null; // percentage from top, 0-100
  bench: boolean;
}

export type Gender = "Boys" | "Girls" | "Coed";

export type Division = "U-8" | "U-10" | "U-12" | "U-14" | "U-16" | "U-18";

export type SplitBy = "none" | "half" | "quarter";

// One row per player, per lineup. See supabase migration create_field_pos.sql.
export interface FieldPosition {
  id: string;
  lineup_id: string;
  player_id: string;
  x: number | null; // percentage from left, 0-100
  y: number | null; // percentage from top, 0-100
  bench: boolean;
}

// Client-side view of a single player's placement within the active lineup.
// A player with no Placement is "unplaced" and shows in the sidebar.
export interface Placement {
  x: number | null;
  y: number | null;
  bench: boolean;
}
