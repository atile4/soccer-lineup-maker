-- Fix type mismatch: teams.user_id is text but auth.uid() returns uuid.
-- Both functions compared text = uuid which throws "operator does not exist".
-- Cast auth.uid() to text to match the column type.

CREATE OR REPLACE FUNCTION owns_game(check_game_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM games g
    JOIN teams t ON t.id = g.team_id
    WHERE g.id = check_game_id AND t.user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION owns_lineup(check_lineup_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM lineups l
    JOIN games g ON g.id = l.game_id
    JOIN teams t ON t.id = g.team_id
    WHERE l.id = check_lineup_id AND t.user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;