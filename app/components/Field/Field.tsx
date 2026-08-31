"use client";

import { useCallback, useRef } from "react";
import Image from "next/image";
import { useDrop } from "react-dnd";
import { useLineup } from "@/context/LineupContext";
import { ItemTypes, PlayerDragItem } from "../dnd/itemTypes";
import { FieldPlayer } from "./FieldPlayer";
import { fieldStyles as styles } from "./Field.styles";

const clamp = (n: number) => Math.max(0, Math.min(100, n));

// The soccer field: a drop target that converts a drop point into percentage
// coordinates, plus the on-field player tokens layered on top of the image.
export function Field() {
  const { fieldedPlayers, placements, placeOnField, loading } = useLineup();
  const fieldRef = useRef<HTMLDivElement | null>(null);

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ItemTypes.PLAYER,
      drop: (item: PlayerDragItem, monitor) => {
        const rect = fieldRef.current?.getBoundingClientRect();
        const offset = monitor.getClientOffset();
        if (!rect || !offset) return;
        const x = clamp(((offset.x - rect.left) / rect.width) * 100);
        const y = clamp(((offset.y - rect.top) / rect.height) * 100);
        placeOnField(item.playerId, x, y);
      },
      collect: (monitor) => ({ isOver: monitor.isOver() }),
    }),
    [placeOnField],
  );

  // Attach both the drop target and our measuring ref to the same node.
  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      fieldRef.current = node;
      drop(node);
    },
    [drop],
  );

  return (
    <div
      ref={setRefs}
      className={`${styles.wrapper} ${isOver ? styles.wrapperOver : ""}`}
    >
      <Image
        src="/images/soccer_field.png"
        alt="Soccer field"
        width={2000}
        height={3027}
        className={styles.image}
        draggable={false}
        priority
      />

      {loading && (
        <div className={styles.loadingOverlay} role="status" aria-live="polite">
          <div className={styles.loadingSpinner} />
          <p className={styles.loadingText}>Loading field...</p>
        </div>
      )}

      {fieldedPlayers.map((player) => {
        const placement = placements[player.id];
        if (!placement || placement.x == null || placement.y == null)
          return null;
        return (
          <FieldPlayer
            key={player.id}
            player={player}
            x={placement.x}
            y={placement.y}
          />
        );
      })}
    </div>
  );
}

export default Field;
