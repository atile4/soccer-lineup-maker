import { supabase } from "@/lib/supabase";

export interface TeamRuleSetting {
  team_id: string;
  rule_id: string;
  enabled: boolean;
}

export async function fetchTeamRuleSettings(
  teamId: string,
): Promise<TeamRuleSetting[]> {
  const { data, error } = await supabase
    .from("team_rule_settings")
    .select("*")
    .eq("team_id", teamId);

  if (error) throw error;
  return data ?? [];
}

export async function upsertTeamRuleSetting(
  teamId: string,
  ruleId: string,
  enabled: boolean,
): Promise<TeamRuleSetting> {
  const { data, error } = await supabase
    .from("team_rule_settings")
    .upsert({ team_id: teamId, rule_id: ruleId, enabled }, { onConflict: "team_id,rule_id" })
    .select()
    .single();

  if (error) throw error;
  return data;
}
