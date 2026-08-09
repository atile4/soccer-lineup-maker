"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useDrop } from "react-dnd";
import PlayerCard from "./PlayerCard";
import { playerSidebarStyles } from "./PlayerSidebar.styles";
import { DraggablePlayer } from "../dnd/DraggablePlayer";
import { ItemTypes, PlayerDragItem } from "../dnd/itemTypes";
import { useLineup } from "@/context/LineupContext";
import { usePlayerInfo } from "@/context/PlayerInfoContext";
import { useTeam } from "@/context/TeamContext";
import { createPlayer } from "@/services/players";
import Modal from "../Modal";
import {
  MAX_PLAYER_NAME_CHARS,
  MAX_PLAYER_NUMBER_CHARS,
  MAX_PLAYER_POSITION_CHARS,
} from "@/app/constants/player_limits";

// The sidebar list shows only players that aren't yet placed for the active
// lineup. Dropping a placed player back here removes them from the lineup.
export const PlayerList = () => {
  const {
    players,
    unplacedPlayers,
    unplace,
    applyPlayerUpdate,
    removePlayer,
    loading,
    addPlayer,
  } = useLineup();
  const { openPlayer } = usePlayerInfo();
  const { currentTeam } = useTeam();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [position, setPosition] = useState("");
  const [error, setError] = useState("");

  const nextNumber = Math.max(...players.map((p) => p.number), 0) + 1;

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setName("");
    setNumber("");
    setPosition("");
    setError("");
  };

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required");
      return;
    }
    const parsedNumber = number === "" ? nextNumber : Number(number);
    if (!Number.isInteger(parsedNumber) || parsedNumber < 0) {
      setError("Number must be a valid whole number");
      return;
    }
    setError("");
    try {
      const player = await createPlayer(currentTeam!.id, {
        name: trimmed,
        number: parsedNumber,
        position: position.trim(),
      });
      addPlayer(player);
      closeCreateModal();
    } catch {
      setError("Failed to create player");
    }
  };

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ItemTypes.PLAYER,
      drop: (item: PlayerDragItem) => unplace(item.playerId),
      collect: (monitor) => ({ isOver: monitor.isOver() }),
    }),
    [unplace],
  );

  return (
    <aside
      ref={(node) => {
        drop(node);
      }}
      className={`${playerSidebarStyles.playerListAside} ${
        isOver ? playerSidebarStyles.playerListAsideIsOver : ""
      }`}
    >
      <div className={playerSidebarStyles.playerListGrid}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={playerSidebarStyles.playerListSkeleton} />
            ))
          : unplacedPlayers.map((player) => (
              <DraggablePlayer
                key={player.id}
                playerId={player.id}
                name={player.name}
                number={player.number}
                jerseyColor={currentTeam?.color}
                previewVariant="default"
                onClick={(e) =>
                  openPlayer(
                    player,
                    e.currentTarget,
                    applyPlayerUpdate,
                    removePlayer,
                  )
                }
              >
                <PlayerCard
                  name={player.name}
                  number={player.number}
                  jerseyColor={currentTeam?.color}
                />
              </DraggablePlayer>
            ))}
        {!loading && (
          <button
            type="button"
            className={playerSidebarStyles.playerListCreateButton}
            aria-label="Create player"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className={playerSidebarStyles.playerListCreateIcon} />
            <span className={playerSidebarStyles.playerListCreateLabel}>
              Create Player
            </span>
          </button>
        )}
      </div>

      <Modal open={showCreateModal} onClose={closeCreateModal}>
        <h2 className={playerSidebarStyles.createModalTitle}>Create Player</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
          className={playerSidebarStyles.createModalForm}
        >
          <div>
            <label
              htmlFor="player-name"
              className={playerSidebarStyles.createModalLabel}
            >
              Name
            </label>
            <div className={playerSidebarStyles.createModalInputWrap}>
              <input
                id="player-name"
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value.slice(0, MAX_PLAYER_NAME_CHARS))
                }
                maxLength={MAX_PLAYER_NAME_CHARS}
                className={playerSidebarStyles.createModalInput}
                placeholder="Player name"
                autoFocus
              />
              <span className={playerSidebarStyles.createModalCounter}>
                {name.length}/{MAX_PLAYER_NAME_CHARS}
              </span>
            </div>
            {error && (
              <p className={playerSidebarStyles.createModalError}>{error}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="player-number"
              className={playerSidebarStyles.createModalLabel}
            >
              Number
            </label>
            <div className={playerSidebarStyles.createModalInputWrap}>
              <input
                id="player-number"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={number}
                onChange={(e) =>
                  setNumber(
                    e.target.value
                      .replace(/[^0-9]/g, "")
                      .slice(0, MAX_PLAYER_NUMBER_CHARS),
                  )
                }
                maxLength={MAX_PLAYER_NUMBER_CHARS}
                placeholder={String(nextNumber)}
                className={playerSidebarStyles.createModalInput}
              />
              <span className={playerSidebarStyles.createModalCounter}>
                {number.length}/{MAX_PLAYER_NUMBER_CHARS}
              </span>
            </div>
          </div>
          <div>
            <label
              htmlFor="player-position"
              className={playerSidebarStyles.createModalLabel}
            >
              Position
            </label>
            <div className={playerSidebarStyles.createModalInputWrap}>
              <input
                id="player-position"
                type="text"
                value={position}
                onChange={(e) =>
                  setPosition(e.target.value.slice(0, MAX_PLAYER_POSITION_CHARS))
                }
                maxLength={MAX_PLAYER_POSITION_CHARS}
                className={playerSidebarStyles.createModalInput}
                placeholder="e.g FWD, DMF, LW"
              />
              <span className={playerSidebarStyles.createModalCounter}>
                {position.length}/{MAX_PLAYER_POSITION_CHARS}
              </span>
            </div>
          </div>
          <div className={playerSidebarStyles.createModalActions}>
            <button
              type="button"
              onClick={closeCreateModal}
              className={playerSidebarStyles.createModalCancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={playerSidebarStyles.createModalSubmitButton}
            >
              Create
            </button>
          </div>
        </form>
      </Modal>
    </aside>
  );
};
