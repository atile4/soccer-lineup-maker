"use client";

import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { teamBuilderStyles as s } from "./TeamBuilder.styles";
import type { DraftPlayer } from "./TeamBuilder";
import {
  MAX_PLAYER_NAME_CHARS,
  MAX_PLAYER_NUMBER_CHARS,
  MAX_PLAYER_POSITION_CHARS,
} from "@/app/constants/playerLimits";

type EditField = "name" | "number" | "position";

function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

type RosterProps = {
  players: DraftPlayer[];
  duplicateNumbers: string[];
  color: string;
  onUpdatePlayer: (
    draftId: string,
    updates: Partial<Pick<DraftPlayer, "name" | "number" | "position">>,
  ) => void;
  onRemovePlayer: (draftId: string) => void;
};

export default function Roster({
  players,
  duplicateNumbers,
  color,
  onUpdatePlayer,
  onRemovePlayer,
}: RosterProps) {
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<EditField | null>(null);
  const [draftValue, setDraftValue] = useState("");

  const dupeMessage =
    duplicateNumbers.length === 1
      ? `${duplicateNumbers.length} players share #${duplicateNumbers[0]}`
      : duplicateNumbers.length > 1
        ? `${duplicateNumbers.length} jersey numbers are used more than once (${duplicateNumbers
          .map((n) => `#${n}`)
          .join(", ")})`
        : "";

  const beginEdit = (draftId: string, field: EditField, currentValue: string) => {
    setEditingDraftId(draftId);
    setEditingField(field);
    setDraftValue(currentValue);
  };

  const commitEdit = (draftId: string) => {
    if (!editingField) return;
    onUpdatePlayer(draftId, { [editingField]: draftValue.trim() });
    cancelEdit();
  };

  const cancelEdit = () => {
    setEditingDraftId(null);
    setEditingField(null);
    setDraftValue("");
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    draftId: string,
  ) => {
    if (e.key === "Enter") {
      commitEdit(draftId);
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  const isEditing = (draftId: string, field: EditField) =>
    editingDraftId === draftId && editingField === field;

  return (
    <>
      {duplicateNumbers.length > 0 && (
        <div className={s.dupeWarning}>
          <span className={s.dupeWarningText}>{dupeMessage}</span>
        </div>
      )}

      <div className={s.rosterCard}>
        <div className={s.rosterHeader}>
          <h3 className={s.rosterTitle}>Roster</h3>
          <span className={s.rosterCount}>{players.length}</span>
        </div>

        {players.length === 0 ? (
          <div className={s.emptyState}>
            <div className={s.emptyIcon}>
              <Pencil size={22} />
            </div>
            <p className={s.emptyTitle}>No players yet</p>
            <p className={s.emptySubtitle}>
              Add your first player above to start the roster.
            </p>
          </div>
        ) : (
          <ul className={s.rosterList}>
            {players.map((p) => {
              const isDupe = p.number && duplicateNumbers.includes(p.number);
              const name = p.name || "Unnamed player";
              return (
                <li
                  key={p.draftId}
                  className={`${s.rosterRow} ${isDupe ? s.rosterRowDupe : ""}`}
                >
                  {/* Number badge — editable on click */}
                  {isEditing(p.draftId, "number") ? (
                    <input
                      autoFocus
                      value={draftValue}
                      onChange={(e) =>
                        setDraftValue(
                          e.target.value
                            .replace(/\D/g, "")
                            .slice(0, MAX_PLAYER_NUMBER_CHARS),
                        )
                      }
                      onKeyDown={(e) => handleKeyDown(e, p.draftId)}
                      onBlur={() => commitEdit(p.draftId)}
                      className={s.editInputSmall}
                      maxLength={MAX_PLAYER_NUMBER_CHARS}
                      aria-label="Jersey number"
                    />
                  ) : (
                    <button
                      type="button"
                      className={s.numberBadge}
                      style={{ backgroundColor: color, color: isLight(color) ? "#1a1a1a" : "#ffffff" }}
                      onClick={() => beginEdit(p.draftId, "number", p.number)}
                      aria-label={`Edit number ${p.number || ""}`}
                    >
                      {p.number || "–"}
                    </button>
                  )}

                  {/* Name — editable on click */}
                  <div className={s.editInputWrap}>
                    {isEditing(p.draftId, "name") ? (
                      <input
                        autoFocus
                        value={draftValue}
                        onChange={(e) =>
                          setDraftValue(
                            e.target.value.slice(0, MAX_PLAYER_NAME_CHARS),
                          )
                        }
                        onKeyDown={(e) => handleKeyDown(e, p.draftId)}
                        onBlur={() => commitEdit(p.draftId)}
                        className={s.editInput}
                        maxLength={MAX_PLAYER_NAME_CHARS}
                        aria-label="Player name"
                      />
                    ) : (
                      <div
                        className={s.rosterName}
                        onClick={() => beginEdit(p.draftId, "name", p.name)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            beginEdit(p.draftId, "name", p.name);
                          }
                        }}
                      >
                        {name}
                      </div>
                    )}
                  </div>

                  {/* Position — editable chip */}
                  {isEditing(p.draftId, "position") ? (
                    <input
                      autoFocus
                      value={draftValue}
                      onChange={(e) =>
                        setDraftValue(
                          e.target.value.slice(0, MAX_PLAYER_POSITION_CHARS),
                        )
                      }
                      onKeyDown={(e) => handleKeyDown(e, p.draftId)}
                      onBlur={() => commitEdit(p.draftId)}
                      className={s.editInput}
                      style={{ width: "4rem" }}
                      maxLength={MAX_PLAYER_POSITION_CHARS}
                      aria-label="Player position"
                    />
                  ) : (
                    <button
                      type="button"
                      className={s.positionChip}
                      onClick={() => beginEdit(p.draftId, "position", p.position)}
                      aria-label={`Edit position ${p.position || ""}`}
                    >
                      {p.position || "–"}
                    </button>
                  )}

                  <button
                    type="button"
                    aria-label="Delete player"
                    className={s.deleteButton}
                    onClick={() => onRemovePlayer(p.draftId)}
                  >
                    <X size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
