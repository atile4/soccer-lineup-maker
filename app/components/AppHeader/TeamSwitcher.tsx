"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Check, Plus, Trash2 } from "lucide-react";
import { teamSwitcherStyles as styles } from "./TeamSwitcher.styles";
import { useTeam } from "@/context/TeamContext";
import { TeamWithPlayerCount } from "@/app/types";
import { MAX_TEAMS } from "@/app/constants/playerLimits";
import DeleteTeamWarningModal from "./DeleteTeamWarningModal";

// One line of "division · gender · player count" text
const teamMeta = (team: TeamWithPlayerCount) =>
  [
    team.division,
    team.gender,
    `${team.playerCount} ${team.playerCount === 1 ? "player" : "players"}`,
  ]
    .filter(Boolean)
    .join(" · ");

export default function TeamSwitcher() {
  const { teams, currentTeamId, loading, switchTeam, deleteTeam } = useTeam();
  const [isOpen, setIsOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<TeamWithPlayerCount | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const router = useRouter();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Same outside-click pattern as ProfileMenu.tsx
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  if (loading) return null;

  const handleSelect = (teamId: string) => {
    switchTeam(teamId);
    setIsOpen(false);
  };

  const handleCreateTeam = () => {
    if (teams.length >= MAX_TEAMS) {
      setShowLimitWarning(true);
      return;
    }
    setIsOpen(false);
    router.push("/create");
  };

  const handleRequestDelete = (team: TeamWithPlayerCount) => {
    setTeamToDelete(team);
  };

  const handleConfirmDelete = async () => {
    if (!teamToDelete) return;
    setDeleting(true);
    try {
      await deleteTeam(teamToDelete.id);
      setTeamToDelete(null);
    } catch (err) {
      console.error("Failed to delete team:", err);
    } finally {
      setDeleting(false);
    }
  };

  // No teams yet — point the user straight at team creation
  if (teams.length === 0) {
    return (
      <button
        type="button"
        className={styles.emptyTrigger}
        onClick={handleCreateTeam}
      >
        <span className={styles.emptyIconWrap} aria-hidden="true">
          <Plus className={styles.emptyIcon} />
        </span>
        <span className={styles.emptyText}>Create your first team</span>
      </button>
    );
  }

  const currentTeam = teams.find((t) => t.id === currentTeamId) ?? teams[0];

  return (
    <div className={styles.wrapper}>
      {/* Trigger — shows the currently selected team */}
      <button
        ref={buttonRef}
        type="button"
        className={styles.trigger}
        onClick={() => {
          if (showLimitWarning) setShowLimitWarning(false);
          setIsOpen((prev) => !prev);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={styles.swatch}
          style={{ backgroundColor: currentTeam.color }}
          aria-hidden="true"
        />
        <span className={styles.triggerText}>
          <span className={styles.triggerName}>{currentTeam.name}</span>
          <span className={styles.triggerMeta}>{teamMeta(currentTeam)}</span>
        </span>
        <ChevronDown
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown — every team, same detail layout */}
      {isOpen && (
        <div ref={dropdownRef} className={styles.dropdown} role="listbox">
          {teams.map((team) => {
            const isSelected = team.id === currentTeam.id;
            return (
              <div
                key={team.id}
                className={`${styles.optionRow} ${isSelected ? styles.optionRowSelected : ""}`}
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(team.id)}
                  className={styles.option}
                >
                  <span
                    className={styles.swatch}
                    style={{ backgroundColor: team.color }}
                    aria-hidden="true"
                  />
                  <span className={styles.optionText}>
                    <span className={styles.optionName}>{team.name}</span>
                    <span className={styles.optionMeta}>{teamMeta(team)}</span>
                  </span>
                </button>
                {isSelected ? (
                  <Check className={styles.checkIcon} aria-hidden="true" />
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRequestDelete(team)}
                    className={styles.deleteButton}
                    aria-label={`Delete ${team.name}`}
                    title={`Delete ${team.name}`}
                  >
                    <Trash2 className={styles.deleteIcon} aria-hidden="true" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Create Team Button */}
          <div className={styles.divider} />
          <div className={styles.createOptionWrap}>
            <button
              type="button"
              onClick={handleCreateTeam}
              className={styles.createOption}
            >
              <span className={styles.createIconWrap} aria-hidden="true">
                <Plus className={styles.createIcon} />
              </span>
              <span className={styles.createText}>Create team</span>
            </button>
            {showLimitWarning && (
              <div className={styles.limitPopover} role="alert">
                You can have at most {MAX_TEAMS} teams.
              </div>
            )}
          </div>
        </div>
      )}

      <DeleteTeamWarningModal
        open={teamToDelete !== null}
        team={teamToDelete}
        deleting={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!deleting) setTeamToDelete(null);
        }}
      />
    </div>
  );
}
