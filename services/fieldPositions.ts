import { supabase } from "@/lib/supabase";
import { FieldPosition } from "@/app/types";

// Matches the `unique (lineup_id, player_id)` constraint used for upserts.
const ON_CONFLICT = "lineup_id,player_id";

// Fetch placements for several lineups at once — used to evaluate ruleset
// rules that span a whole game (e.g. quarters played per player). One round
// trip; the per-row "owns_lineup" RLS policy still applies to each lineup.
export async function fetchFieldPositionsForLineups(
  lineupIds: string[],
): Promise<FieldPosition[]> {
  if (lineupIds.length === 0) return [];

  const { data, error } = await supabase
    .from("field_positions")
    .select("*")
    .in("lineup_id", lineupIds);

  if (error) throw error;
  return data as FieldPosition[];
}

// Place (or move) a player on the field at the given percentage coordinates.
export async function placePlayerOnField(
  lineupId: string,
  playerId: string,
  x: number,
  y: number,
): Promise<FieldPosition> {
  const { data, error } = await supabase
    .from("field_positions")
    .upsert(
      { lineup_id: lineupId, player_id: playerId, x, y, bench: false },
      { onConflict: ON_CONFLICT },
    )
    .select()
    .single();

  if (error) throw error;
  return data as FieldPosition;
}

// Send a single player to the bench (clears coordinates).
export async function benchPlayer(
  lineupId: string,
  playerId: string,
): Promise<FieldPosition> {
  const { data, error } = await supabase
    .from("field_positions")
    .upsert(
      { lineup_id: lineupId, player_id: playerId, x: null, y: null, bench: true },
      { onConflict: ON_CONFLICT },
    )
    .select()
    .single();

  if (error) throw error;
  return data as FieldPosition;
}

// Remove a player from the lineup entirely (returns them to the sidebar).
export async function removeFieldPosition(
  lineupId: string,
  playerId: string,
): Promise<void> {
  const { error } = await supabase
    .from("field_positions")
    .delete()
    .eq("lineup_id", lineupId)
    .eq("player_id", playerId);

  if (error) throw error;
}

// Bench every given player in one round trip.
export async function benchAllPlayers(
  lineupId: string,
  playerIds: string[],
): Promise<void> {
  if (playerIds.length === 0) return;

  const rows = playerIds.map((player_id) => ({
    lineup_id: lineupId,
    player_id,
    x: null,
    y: null,
    bench: true,
  }));

  const { error } = await supabase
    .from("field_positions")
    .upsert(rows, { onConflict: ON_CONFLICT });

  if (error) throw error;
}
