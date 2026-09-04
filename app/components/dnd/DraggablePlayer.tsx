"use client";

import { ReactNode, useEffect } from "react";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { ItemTypes, PlayerDragItem } from "./itemTypes";
import type { PlayerTokenVariant } from "../PlayerSidebar/PlayerToken";

interface DraggablePlayerProps {
  playerId: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  // Preview payload — used by CustomDragLayer to render the dragged token.
  name?: string;
  number: number | null;
  jerseyColor?: string;
  previewVariant?: PlayerTokenVariant;
}

// Reusable drag source for a player. Wraps any content (sidebar card, bench
// chip, or field token) so it can be dropped onto the field, bench, or sidebar.
export function DraggablePlayer({
  playerId,
  children,
  className,
  style,
  onClick,
  name,
  number,
  jerseyColor,
  previewVariant,
}: DraggablePlayerProps) {
  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: ItemTypes.PLAYER,
      item: {
        playerId,
        name,
        number,
        jerseyColor,
        previewVariant,
      } as PlayerDragItem,
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [playerId, name, number, jerseyColor, previewVariant],
  );

  // Suppress the browser's native HTML5 drag image so the only preview shown is
  // the CustomDragLayer. This keeps the drag visuals identical on mouse (HTML5
  // backend) and touch (Touch backend, which renders no native image at all).
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  return (
    <div
      ref={(node) => {
        drag(node);
      }}
      className={className}
      style={{
        opacity: isDragging ? 0.4 : 1,
        cursor: "grab",
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
