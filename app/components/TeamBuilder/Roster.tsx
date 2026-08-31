"use client";

import { Users, X } from "lucide-react";
import { teamBuilderStyles as s } from "./TeamBuilder.styles";
import type { DraftPlayer } from "./TeamBuilder";

type RosterProps = {
  players: DraftPlayer[];
  duplicateNumbers: string[];
  onRemovePlayer: (draftId: string) => void;
};

export default function Roster({
  players,
  duplicateNumbers,
  onRemovePlayer,
}: RosterProps) {
  const dupeMessage =
    duplicateNumbers.length === 1
      ? `${duplicateNumbers.length} players share #${duplicateNumbers[0]}`
      : duplicateNumbers.length > 1
        ? `${duplicateNumbers.length} jersey numbers are used more than once (${duplicateNumbers
            .map((n) => `#${n}`)
            .join(", ")})`
        : "";

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
              <Users size={22} />
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
                  <div className={s.numberBadge}>{p.number || "–"}</div>
                  <div className="flex-1 min-w-0">
                    <div className={s.rosterName}>{name}</div>
                    <div className={s.rosterSub}>
                      {p.number ? `No. ${p.number}` : "No number"}
                    </div>
                  </div>
                  {p.position && (
                    <span className={s.positionChip}>{p.position}</span>
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
