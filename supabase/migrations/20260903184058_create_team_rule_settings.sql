create table team_rule_settings (
  team_id uuid not null references teams(id) on delete cascade,
  rule_id text not null,
  enabled boolean not null default true,
  primary key (team_id, rule_id)
);

ALTER TABLE team_rule_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coaches_own_team_rule_settings"
  ON team_rule_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_rule_settings.team_id
        AND auth.uid() = teams.user_id
    )
  );
