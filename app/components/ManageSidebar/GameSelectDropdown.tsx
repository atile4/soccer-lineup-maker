"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Pencil, Trash2, X } from "lucide-react";
import { sidebarStyles } from "./ManageSidebar.styles";
import { Game } from "@/app/types";

const MAX_GAME_NAME_CHARS = 20;

interface GameSelectDropdownProps {
  games: Game[];
  currentGameId: string | null;
  onSelect: (gameId: string) => void;
  onRequestDelete: (game: Game) => void;
  onRename: (gameId: string, name: string) => Promise<void>;
}

// Custom game picker that mimics the native <select> but lets each game carry
// inline rename controls and — except for the currently selected one — a delete
// button.
export default function GameSelectDropdown({
  games,
  currentGameId,
  onSelect,
  onRequestDelete,
  onRename,
}: GameSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [savingRename, setSavingRename] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const currentGame = games.find((g) => g.id === currentGameId) ?? null;

  const cancelEdit = () => {
    setEditingId(null);
    setDraftName("");
  };

  // Close the menu on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
        cancelEdit();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        cancelEdit();
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // Focus and select the input when entering edit mode.
  useEffect(() => {
    if (editingId) editInputRef.current?.select();
  }, [editingId]);

  const handleSelect = (gameId: string) => {
    onSelect(gameId);
    setOpen(false);
  };

  const startEdit = (game: Game) => {
    setEditingId(game.id);
    setDraftName(game.name);
  };

  const commitRename = async (gameId: string) => {
    const trimmed = draftName.trim();
    const game = games.find((g) => g.id === gameId);
    // Nothing to do if the name is blank or unchanged.
    if (!trimmed || trimmed === game?.name) {
      cancelEdit();
      return;
    }
    setSavingRename(true);
    try {
      await onRename(gameId, trimmed);
      cancelEdit();
    } catch {
      // onRename surfaces its own error toast; keep edit mode open to retry.
    } finally {
      setSavingRename(false);
    }
  };

  return (
    <div className={sidebarStyles.selectWrapper} ref={wrapperRef}>
      <button
        type="button"
        className={sidebarStyles.gameSelectButton}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select game"
      >
        <span className={sidebarStyles.gameSelectButtonLabel}>
          {currentGame?.name ?? "No games"}
        </span>
        <ChevronDown
          className={sidebarStyles.gameSelectButtonIcon}
          aria-hidden="true"
        />
      </button>

      {open && games.length > 0 && (
        <ul className={sidebarStyles.gameSelectMenu} role="listbox">
          {games.map((g) => {
            const isCurrent = g.id === currentGameId;
            const isEditing = g.id === editingId;
            return (
              <li
                key={g.id}
                role="option"
                aria-selected={isCurrent}
                className={`${sidebarStyles.gameSelectOption} ${
                  isCurrent ? sidebarStyles.gameSelectOptionActive : ""
                }`}
              >
                {isEditing ? (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        ref={editInputRef}
                        type="text"
                        value={draftName}
                        disabled={savingRename}
                        className={sidebarStyles.gameSelectEditInput}
                        maxLength={MAX_GAME_NAME_CHARS}
                        onChange={(e) =>
                          setDraftName(
                            e.target.value.slice(0, MAX_GAME_NAME_CHARS),
                          )
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            commitRename(g.id);
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            e.stopPropagation();
                            cancelEdit();
                          }
                        }}
                        aria-label={`Rename ${g.name}`}
                      />
                      <button
                        type="button"
                        className={sidebarStyles.gameSelectEditButton}
                        onClick={() => commitRename(g.id)}
                        disabled={savingRename}
                        aria-label="Save name"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        type="button"
                        className={sidebarStyles.gameSelectDeleteButton}
                        onClick={cancelEdit}
                        disabled={savingRename}
                        aria-label="Cancel rename"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <span className="w-full text-right">
                      <span className={sidebarStyles.fieldCounter}>
                        {draftName.length}/{MAX_GAME_NAME_CHARS}
                      </span>
                    </span>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className={sidebarStyles.gameSelectOptionLabel}
                      onClick={() => handleSelect(g.id)}
                    >
                      {g.name}
                    </button>

                    <button
                      type="button"
                      className={sidebarStyles.gameSelectEditButton}
                      onClick={() => startEdit(g)}
                      aria-label={`Rename ${g.name}`}
                    >
                      <Pencil size={16} />
                    </button>

                    {/* Currently selected game can't be deleted. */}
                    {!isCurrent && (
                      <button
                        type="button"
                        className={sidebarStyles.gameSelectDeleteButton}
                        onClick={() => {
                          onRequestDelete(g);
                          setOpen(false);
                        }}
                        aria-label={`Delete ${g.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
