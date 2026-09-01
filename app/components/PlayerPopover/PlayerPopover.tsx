"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Player } from "@/app/types";
import { playerInfoPopoverStyles as s } from "./PlayerPopover.styles";
import { useTeam } from "@/context/TeamContext";
import { useLineup } from "@/context/LineupContext";
import { deletePlayer, updatePlayer } from "@/services/players";
import DeletePlayerModal from "./DeletePlayerModal";
import {
  MAX_PLAYER_NAME_CHARS,
  MAX_PLAYER_POSITION_CHARS,
} from "@/app/constants/playerLimits";
import { numberColorFor } from "@/app/utils/color";

interface PlayerInfoPopoverProps {
  player: Player;
  anchor: HTMLElement;
  onClose: () => void;
  onPlayerUpdate: (updated: Player) => void;
  onPlayerDelete: (playerId: string) => void;
}

const GAP = 8; // space between the anchor and the popover
const MARGIN = 8; // keep the popover this far from the viewport edges

type EditableField = "name" | "position";

export default function PlayerInfoPopover({
  player,
  anchor,
  onClose,
  onPlayerUpdate,
  onPlayerDelete,
}: PlayerInfoPopoverProps) {
  const { currentTeam } = useTeam();
  const { placements } = useLineup();
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );

  // --- editing state ---
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [nameDraft, setNameDraft] = useState(player.name);
  const [positionDraft, setPositionDraft] = useState(player.position);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- delete state ---
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Where this player currently sits in the active lineup — shown in the
  // delete confirmation so the coach knows what they're removing.
  const placement = placements[player.id];
  const lineupStatus = !placement
    ? "Not in lineup"
    : placement.bench
      ? "On the bench"
      : "On the field";

  // If a different player gets passed in while the popover is still open
  // (e.g. clicking straight from one player to another), reset local
  // editing state so we don't show stale drafts or a leftover error.
  useEffect(() => {
    setNameDraft(player.name);
    setPositionDraft(player.position);
    setEditingField(null);
    setError(null);
  }, [player.id, player.name, player.position]);

  useLayoutEffect(() => {
    const popover = popoverRef.current;
    if (!popover) return;

    const anchorRect = anchor.getBoundingClientRect();
    const { offsetWidth: width, offsetHeight: height } = popover;

    const fitsBelow =
      anchorRect.bottom + GAP + height + MARGIN <= window.innerHeight;
    const top = fitsBelow
      ? anchorRect.bottom + GAP
      : Math.max(MARGIN, anchorRect.top - GAP - height);

    // Prefer bottom-right: popover's left edge starts at the anchor's left edge.
    // Flip to bottom-left (popover's right edge ends at the anchor's right edge)
    // if it would overflow the right side of the viewport.
    const fitsRight = anchorRect.left + width + MARGIN <= window.innerWidth;
    const left = fitsRight
      ? anchorRect.left
      : Math.max(MARGIN, anchorRect.right - width);

    setCoords({ top, left });
  }, [anchor]);

  // close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // The delete modal owns Escape while it's open — let it dismiss
        // itself rather than tearing down the whole popover behind it.
        if (confirmingDelete) return;
        if (editingField) {
          setEditingField(null);
          setNameDraft(player.name);
          setPositionDraft(player.position);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, editingField, confirmingDelete, player.name, player.position]);

  const handleSave = async (field: EditableField) => {
    const draft = field === "name" ? nameDraft.trim() : positionDraft.trim();
    const original = field === "name" ? player.name : player.position;

    if (field === "name" && !draft) {
      setError("Name can't be empty");
      return;
    }

    if (draft === original) {
      setEditingField(null);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const updated = await updatePlayer(player.id, { [field]: draft });
      onPlayerUpdate(updated);
      setEditingField(null);
    } catch (err) {
      console.error(`Failed to update player ${field}:`, err);
      setError("Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleFieldKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: EditableField,
  ) => {
    if (e.key === "Enter") {
      handleSave(field);
    } else if (e.key === "Escape") {
      e.stopPropagation();
      setEditingField(null);
      setNameDraft(player.name);
      setPositionDraft(player.position);
    }
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deletePlayer(player.id);
      // Drops the player from the roster and closes the popover. Because this
      // unmounts us, there's no state to reset afterwards.
      onPlayerDelete(player.id);
    } catch (err) {
      console.error("Failed to delete player:", err);
      setDeleteError("Couldn't delete. Try again.");
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Transparent full-screen layer to catch outside clicks. */}
      <div className={s.overlay} onClick={onClose}>
        <div
          ref={popoverRef}
          role="dialog"
          aria-modal="true"
          className={`${s.popover} ${coords ? s.popoverVisible : s.popoverHidden}`}
          style={{
            top: coords?.top ?? 0,
            left: coords?.left ?? 0,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={s.headerRow}>
            <div className={s.identitySection}>
              {/* Name — text or inline input depending on edit state */}
              <div className={s.nameRow}>
                {editingField === "name" ? (
                  <div className={`${s.editInputWrap} w-full`}>
                    <input
                      autoFocus
                      value={nameDraft}
                      disabled={saving}
                      onChange={(e) =>
                        setNameDraft(
                          e.target.value.slice(0, MAX_PLAYER_NAME_CHARS),
                        )
                      }
                      maxLength={MAX_PLAYER_NAME_CHARS}
                      onKeyDown={(e) => handleFieldKeyDown(e, "name")}
                      onBlur={() => handleSave("name")}
                      className={s.nameInput}
                      aria-label="Player name"
                    />
                    <span className={s.counter}>
                      {nameDraft.length}/{MAX_PLAYER_NAME_CHARS}
                    </span>
                  </div>
                ) : (
                  <>
                    <h3 className={s.name}>{player.name}</h3>
                    <button
                      type="button"
                      className={s.editIconButton}
                      onClick={() => setEditingField("name")}
                      aria-label="Edit name"
                    >
                      <Pencil size={13} />
                    </button>
                  </>
                )}
              </div>

              {/* Position — text or inline input depending on edit state */}
              <div className={s.positionRow}>
                {editingField === "position" ? (
                  <div className={`${s.editInputWrap} w-24`}>
                    <input
                      autoFocus
                      value={positionDraft}
                      disabled={saving}
                      onChange={(e) =>
                        setPositionDraft(
                          e.target.value.slice(0, MAX_PLAYER_POSITION_CHARS),
                        )
                      }
                      maxLength={MAX_PLAYER_POSITION_CHARS}
                      onKeyDown={(e) => handleFieldKeyDown(e, "position")}
                      onBlur={() => handleSave("position")}
                      className={s.positionInput}
                      aria-label="Player position"
                    />
                    <span className={s.counter}>
                      {positionDraft.length}/{MAX_PLAYER_POSITION_CHARS}
                    </span>
                  </div>
                ) : (
                  <>
                    <span className={s.position}>{player.position || "—"}</span>
                    <button
                      type="button"
                      className={s.editIconButton}
                      onClick={() => setEditingField("position")}
                      aria-label="Edit position"
                    >
                      <Pencil size={11} />
                    </button>
                  </>
                )}
              </div>

              {error && <p className={s.errorText}>{error}</p>}
            </div>

            {/* Jersey badge — same shape as PlayerToken, sized down */}
            <div className={s.jerseyWrapper}>
              <svg viewBox="0 0 100 90" width="66" height="60">
                <path
                  d="M25 10 L10 30 L25 35 L25 80 L75 80 L75 35 L90 30 L75 10 C70 18 60 22 50 22 C40 22 30 18 25 10Z"
                  fill={currentTeam?.color ?? "#7C3AED"}
                  className={s.jerseyPath}
                />
                <text
                  x="50"
                  y="58"
                  textAnchor="middle"
                  fontSize="26"
                  fontWeight="bold"
                  fill={numberColorFor(currentTeam?.color ?? "#7C3AED")}
                  fontFamily="Arial, sans-serif"
                >
                  {player.number}
                </text>
              </svg>
            </div>
          </div>

          {/* Delete action — bottom-right corner */}
          <button
            type="button"
            className={s.deleteButton}
            aria-label="Delete player"
            onClick={() => {
              setDeleteError(null);
              setConfirmingDelete(true);
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <DeletePlayerModal
        open={confirmingDelete}
        player={player}
        status={lineupStatus}
        deleting={deleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (deleting) return; // don't bail out mid-delete
          setConfirmingDelete(false);
          setDeleteError(null);
        }}
      />
    </>
  );
}
