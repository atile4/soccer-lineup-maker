"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Plus } from "lucide-react";
import { sidebarStyles } from "./ManageSidebar.styles";

// services
import {
  updateSplit,
  updateNotes,
  updateGameName,
  createGameWithLineups,
  deleteGame,
} from "@/services/games";

// context
import { useGame } from "@/context/GameContext";

// types
import { SplitBy, Game } from "@/app/types";

// util
import { getPeriodsToRemove } from "@/app/utils/period";
import SplitChangeWarningModal from "./SplitChangeWarningModal";
import CreateGameModal from "./CreateGameModal";
import DeleteGameModal from "./DeleteGameModal";
import GameSelectDropdown from "./GameSelectDropdown";

const MAX_NOTES_CHARS = 500;

interface ManageGamesTabProps {
  teamId: string | null;
}

type ToastVariant = "success" | "error";

interface ToastState {
  message: string;
  variant: ToastVariant;
}

// Manage Games Tab
export const ManageGamesTab: React.FC<ManageGamesTabProps> = ({ teamId }) => {
  const { games, currentGame, switchGame, refreshGameData } = useGame();

  const [splitBy, setSplitBy] = useState<SplitBy>();
  const [notes, setNotes] = useState(""); // @TODO save notes to db
  const [pendingSplit, setPendingSplit] = useState<SplitBy | null>(null);
  const [savingSplit, setSavingSplit] = useState(false);

  const [showCreateGameModal, setShowCreateGameModal] = useState(false);
  const [creatingGame, setCreatingGame] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
  const [deletingGame, setDeletingGame] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Dirty check: button only enabled once the draft differs from what's actually saved on currentGame.
  const notesDirty = notes !== (currentGame?.notes ?? "");

  const showToast = (message: string, variant: ToastVariant = "success") => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 2500);
  };

  const periodsToRemove =
    splitBy && pendingSplit ? getPeriodsToRemove(splitBy, pendingSplit) : [];

  // keep the split selector in sync with the active game
  useEffect(() => {
    if (currentGame) {
      setSplitBy(currentGame.split_by);
      setNotes(currentGame.notes ?? ""); // keep the notes box in sync when switching games
    }
  }, [currentGame]);

  // handling changing game split
  const handleSplitSelect = (value: SplitBy) => {
    if (!currentGame || !splitBy) return;

    const removed = getPeriodsToRemove(splitBy, value);
    if (removed.length === 0) {
      // Growing or unchanged, no rows removed
      applySplitChange(value);
      return;
    }

    // Shrinking — stage it and let the modal confirm
    setPendingSplit(value);
  };

  const applySplitChange = async (value: SplitBy) => {
    if (!currentGame) return;
    setSavingSplit(true);
    try {
      await updateSplit(currentGame.id, value);
      setSplitBy(value);
      await refreshGameData();
    } catch (err) {
      console.error("Failed to save split type:", err); // @TODO warning modal
    } finally {
      setSavingSplit(false);
      setPendingSplit(null);
    }
  };

  const handleConfirmSplitChange = () => {
    if (pendingSplit) applySplitChange(pendingSplit);
  };

  const handleCancelSplitChange = () => {
    setPendingSplit(null); // select snaps back to splitBy automatically
  };

  // --- Create Game ---
  const handleCreateGame = async (name: string) => {
    if (!teamId) return;
    setCreatingGame(true);
    try {
      const newGame = await createGameWithLineups(teamId, name);
      await refreshGameData(); // pulls the new game (and its lineups) into `games`
      switchGame(newGame.id);
      showToast(`"${newGame.name}" created`);
      setShowCreateGameModal(false);
    } catch (err) {
      console.error("Failed to create game:", err);
      showToast("Couldn't create the game. Try again.", "error");
    } finally {
      setCreatingGame(false);
    }
  };

  // Delete Game Logic
  const handleConfirmDeleteGame = async () => {
    if (!gameToDelete) return;
    setDeletingGame(true);
    try {
      await deleteGame(gameToDelete.id);
      await refreshGameData();
      showToast(`"${gameToDelete.name}" deleted`);
      setGameToDelete(null);
    } catch (err) {
      console.error("Failed to delete game:", err);
      showToast("Couldn't delete the game. Try again.", "error");
    } finally {
      setDeletingGame(false);
    }
  };

  // --- Rename Game --- (inline edit from the game dropdown)
  const handleRenameGame = async (gameId: string, name: string) => {
    try {
      await updateGameName(gameId, name);
      await refreshGameData(); // re-syncs the renamed game into `games`
      showToast(`Renamed to "${name}"`);
    } catch (err) {
      console.error("Failed to rename game:", err);
      showToast("Couldn't rename the game. Try again.", "error");
      throw err; // let the dropdown keep edit mode open to retry
    }
  };

  // --- Save Notes ---
  const handleSaveNotes = async () => {
    if (!currentGame || !notesDirty) return;
    setSavingNotes(true);
    try {
      await updateNotes(currentGame.id, notes);
      await refreshGameData(); // re-syncs currentGame.notes, which clears notesDirty via the effect above
      showToast("Note saved to this game");
    } catch (err) {
      console.error("Failed to save notes:", err);
      showToast("Couldn't save the note. Try again.", "error");
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <>
      {/* Game Selection */}
      <div className={sidebarStyles.fieldGroup}>
        <GameSelectDropdown
          games={games}
          currentGameId={currentGame?.id ?? null}
          onSelect={switchGame}
          onRequestDelete={setGameToDelete}
          onRename={handleRenameGame}
        />

        {/* Create Game button — opens CreateGameModal, disabled with no team selected */}
        <button
          type="button"
          onClick={() => setShowCreateGameModal(true)}
          disabled={!teamId}
          className={sidebarStyles.createGameButton}
        >
          <span className={sidebarStyles.createGamePlus}>
            <Plus size={10} strokeWidth={4} />
          </span>
          Create Game
        </button>
      </div>

      <div className={sidebarStyles.manageSection}>
        {/* Split by */}
        <div className={sidebarStyles.fieldGroup}>
          <h2 className={sidebarStyles.sectionTitle}>Split by:</h2>
          <div className={sidebarStyles.selectWrapper}>
            <select
              className={sidebarStyles.selectInput}
              value={splitBy}
              aria-label="Split by"
              onChange={(e) => handleSplitSelect(e.target.value as SplitBy)}
            >
              <option value="none">None</option>
              <option value="half">Half</option>
              <option value="quarter">Quarter</option>
            </select>
            <ChevronDown
              className={sidebarStyles.customArrowIcon}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Notes */}
        <div className={sidebarStyles.fieldGroup}>
          <h2 className={sidebarStyles.sectionTitle}>Notes:</h2>
          <textarea
            placeholder="Add notes here..."
            value={notes}
            className={sidebarStyles.textArea}
            maxLength={MAX_NOTES_CHARS}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setNotes(e.target.value.slice(0, MAX_NOTES_CHARS))
            }
          />
          <span className={sidebarStyles.fieldCounter}>
            {notes.length}/{MAX_NOTES_CHARS}
          </span>
          {/* Save Notes button — disabled until notes actually differ from currentGame.notes */}
          <button
            type="button"
            onClick={handleSaveNotes}
            disabled={savingNotes || !currentGame || !notesDirty}
            className={sidebarStyles.saveNotesButton}
          >
            {savingNotes ? "Saving…" : "Save Notes"}
          </button>
        </div>
      </div>

      {/* Split-shrink confirmation */}
      {pendingSplit && (
        <SplitChangeWarningModal
          open={pendingSplit !== null}
          fromSplit={splitBy!}
          toSplit={pendingSplit}
          periodsToRemove={periodsToRemove}
          saving={savingSplit}
          onConfirm={handleConfirmSplitChange}
          onCancel={handleCancelSplitChange}
        />
      )}

      {/* Create Game modal — portals to <body> so the sidebar's overflow/collapse animation can't clip it */}
      <CreateGameModal
        open={showCreateGameModal}
        onClose={() => setShowCreateGameModal(false)}
        onCreate={handleCreateGame}
        creating={creatingGame}
      />

      {/* Delete Game confirmation */}
      <DeleteGameModal
        open={gameToDelete !== null}
        gameName={gameToDelete?.name ?? ""}
        deleting={deletingGame}
        onConfirm={handleConfirmDeleteGame}
        onCancel={() => {
          if (!deletingGame) setGameToDelete(null);
        }}
      />

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

export default ManageGamesTab;
