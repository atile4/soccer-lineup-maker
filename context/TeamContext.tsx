"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  fetchTeamsWithPlayerCount,
  setCurrentTeam as persistCurrentTeam,
  deleteTeam as deleteTeamService,
  updateTeamName as updateTeamNameService,
  updateTeamColor as updateTeamColorService,
} from "@/services/teams";
import { fetchCurrentIDs } from "@/services/profiles";
import {
  fetchTeamRuleSettings,
  upsertTeamRuleSetting,
} from "@/services/teamRuleSettings";
import { TeamWithPlayerCount } from "@/app/types";

interface TeamContextValue {
  teams: TeamWithPlayerCount[];
  currentTeamId: string | null;
  currentTeam: TeamWithPlayerCount | null;
  loading: boolean;
  switchTeam: (teamId: string) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  updateTeamName: (teamId: string, name: string) => Promise<void>;
  updateTeamColor: (teamId: string, color: string) => Promise<void>;
  refreshTeams: () => Promise<void>;
  teamRuleSettings: Record<string, boolean>;
  updateTeamRuleSetting: (ruleId: string, enabled: boolean) => Promise<void>;
}

const TeamContext = createContext<TeamContextValue | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;

  const [teams, setTeams] = useState<TeamWithPlayerCount[]>([]);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamRuleSettings, setTeamRuleSettings] = useState<Record<string, boolean>>({});

  const refreshTeams = useCallback(async () => {
    if (!userId) {
      setTeams([]);
      setCurrentTeamId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [teamList, current] = await Promise.all([
        fetchTeamsWithPlayerCount(userId),
        fetchCurrentIDs(userId),
      ]);
      setTeams(teamList);
      setCurrentTeamId((prev) => {
        const persisted = teamList.find((t) => t.id === current.current_team_id);
        const kept = teamList.find((t) => t.id === prev);
        // Prefer the persisted selection, then keep a still-valid in-session
        // selection, otherwise fall back to the first team.
        return persisted?.id ?? kept?.id ?? teamList[0]?.id ?? null;
      });
    } catch (err) {
      console.error("Failed to load teams:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshTeams();
  }, [refreshTeams]);

  // Load rule settings when the current team changes.
  useEffect(() => {
    if (!currentTeamId) {
      setTeamRuleSettings({});
      return;
    }
    fetchTeamRuleSettings(currentTeamId)
      .then((rows) => {
        const settings: Record<string, boolean> = {};
        for (const row of rows) settings[row.rule_id] = row.enabled;
        setTeamRuleSettings(settings);
      })
      .catch((err) => console.error("Failed to load rule settings:", err));
  }, [currentTeamId]);

  const switchTeam = useCallback(
    async (teamId: string) => {
      if (!userId) return;
      const previous = currentTeamId;
      setCurrentTeamId(teamId);
      try {
        await persistCurrentTeam(userId, teamId);
      } catch (err) {
        console.error("Failed to switch teams:", err);
        setCurrentTeamId(previous);
      }
    },
    [userId, currentTeamId],
  );

  const deleteTeam = useCallback(
    async (teamId: string) => {
      // Guard: the active team must never be deleted.
      if (teamId === currentTeamId) return;
      await deleteTeamService(teamId);
      setTeams((prev) => prev.filter((t) => t.id !== teamId));
    },
    [currentTeamId],
  );

  // Optimistically patch a team in local state, persist, and revert on failure.
  const patchTeam = useCallback(
    async (
      teamId: string,
      patch: Partial<TeamWithPlayerCount>,
      persist: () => Promise<unknown>,
      label: string,
    ) => {
      let previous: TeamWithPlayerCount[] = [];
      setTeams((prev) => {
        previous = prev;
        return prev.map((t) => (t.id === teamId ? { ...t, ...patch } : t));
      });
      try {
        await persist();
      } catch (err) {
        console.error(label, err);
        setTeams(previous); // revert the optimistic patch
        throw err; // let the caller surface the failure
      }
    },
    [],
  );

  const updateTeamName = useCallback(
    (teamId: string, name: string) =>
      patchTeam(
        teamId,
        { name },
        () => updateTeamNameService(teamId, name),
        "Failed to update team name:",
      ),
    [patchTeam],
  );

  const updateTeamColor = useCallback(
    (teamId: string, color: string) =>
      patchTeam(
        teamId,
        { color },
        () => updateTeamColorService(teamId, color),
        "Failed to update team color:",
      ),
    [patchTeam],
  );

  const updateTeamRuleSetting = useCallback(
    async (ruleId: string, enabled: boolean) => {
      if (!currentTeamId) return;
      const previous = teamRuleSettings;
      // Optimistic update
      setTeamRuleSettings((prev) => ({ ...prev, [ruleId]: enabled }));
      try {
        await upsertTeamRuleSetting(currentTeamId, ruleId, enabled);
      } catch (err) {
        console.error("Failed to update rule setting:", err);
        setTeamRuleSettings(previous);
        throw err;
      }
    },
    [currentTeamId, teamRuleSettings],
  );

  const currentTeam = teams.find((t) => t.id === currentTeamId) ?? null;

  return (
    <TeamContext.Provider
      value={{
        teams,
        currentTeamId,
        currentTeam,
        loading,
        switchTeam,
        deleteTeam,
        updateTeamName,
        updateTeamColor,
        refreshTeams,
        teamRuleSettings,
        updateTeamRuleSetting,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error("useTeam must be used within a TeamProvider");
  return ctx;
}
