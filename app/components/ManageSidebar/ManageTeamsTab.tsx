"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { sidebarStyles } from "./ManageSidebar.styles";
import ColorSwitcher from "@/app/components/ui/ColorSwitcher";
import { useTeam } from "@/context/TeamContext";
import { AYSO_RULES } from "@/app/utils/ruleset/rules";

type ToastVariant = "success" | "error";

interface ToastState {
  message: string;
  variant: ToastVariant;
}

// Managing teams — edit the current team's name and jersey color. Edits are
// staged locally and committed together by the Save button, persisting through
// TeamContext (optimistic update + revert on failure).
const MAX_TEAM_NAME_CHARS = 20;

export const ManageTeamsTab: React.FC = () => {
  const {
    currentTeam,
    updateTeamName,
    updateTeamColor,
    teamRuleSettings,
    updateTeamRuleSetting,
  } = useTeam();

  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Enable "Save" once either draft differs from what's saved on the team.
  const nameDirty = name.trim() !== (currentTeam?.name ?? "");
  const colorDirty = color !== (currentTeam?.color ?? "");
  const dirty = nameDirty || colorDirty;

  const showToast = (message: string, variant: ToastVariant = "success") => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 2500);
  };

  // Keep the draft fields in sync when switching teams.
  useEffect(() => {
    setName(currentTeam?.name ?? "");
    setColor(currentTeam?.color ?? "");
  }, [currentTeam]);

  const handleSave = async () => {
    if (!currentTeam || !dirty || !name.trim()) return;
    setSaving(true);
    try {
      // Only persist the fields that actually changed.
      if (nameDirty) await updateTeamName(currentTeam.id, name.trim());
      if (colorDirty) await updateTeamColor(currentTeam.id, color);
      showToast("Team saved");
    } catch (err) {
      console.error("Failed to save team:", err);
      showToast("Couldn't save the team. Try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!currentTeam) {
    return (
      <div className={sidebarStyles.emptyState}>
        Select a team to edit its details.
      </div>
    );
  }

  return (
    <>
      {/* Edit team name */}
      <div className={sidebarStyles.fieldGroup}>
        <h2 className={sidebarStyles.sectionTitle}>Edit Team</h2>
        <input
          type="text"
          value={name}
          placeholder="Team name"
          className={sidebarStyles.textInput}
          maxLength={MAX_TEAM_NAME_CHARS}
          onChange={(e) =>
            setName(e.target.value.slice(0, MAX_TEAM_NAME_CHARS))
          }
        />
        <span className={sidebarStyles.fieldCounter}>
          {name.length}/{MAX_TEAM_NAME_CHARS}
        </span>
      </div>

      {/* Edit team color */}
      <div className={sidebarStyles.manageSection}>
        <div className={sidebarStyles.fieldGroup}>
          <h2 className={sidebarStyles.sectionTitle}>Edit Team Color</h2>
          <ColorSwitcher value={color} onChange={setColor} />
        </div>
      </div>

      {/* Save — commits both name and color together */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !dirty || !name.trim()}
        className={sidebarStyles.saveNotesButton}
      >
        {saving ? "Saving…" : "Save"}
      </button>

      {/* Rules toggles */}
      <div className={sidebarStyles.manageSection}>
        <h2 className={sidebarStyles.sectionTitle}>Rules Settings</h2>
        <div className="space-y-3 mt-3">
          {AYSO_RULES.map((rule) => (
            <label
              key={rule.id}
              className="flex items-center justify-between gap-3 cursor-pointer"
            >
              <span className="text-body-sm text-ink">{rule.label}</span>
              <button
                type="button"
                role="switch"
                aria-checked={teamRuleSettings[rule.id] !== false}
                onClick={() =>
                  updateTeamRuleSetting(
                    rule.id,
                    !(teamRuleSettings[rule.id] !== false),
                  )
                }
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-border ${
                  teamRuleSettings[rule.id] !== false
                    ? "bg-accent"
                    : "bg-border"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    teamRuleSettings[rule.id] !== false
                      ? "translate-x-4"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </label>
          ))}
        </div>
      </div>

      {/* Toast — portalled to <body> so its fixed positioning isn't contained by the sidebar's transform */}
      {toast &&
        createPortal(
          <div
            className={
              sidebarStyles[
                toast.variant === "error" ? "toastError" : "toastSuccess"
              ]
            }
          >
            {toast.message}
          </div>,
          document.body,
        )}
    </>
  );
};

export default ManageTeamsTab;
