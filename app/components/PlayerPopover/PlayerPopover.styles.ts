export const playerInfoPopoverStyles = {
  overlay: "fixed inset-0 z-50",

  popover:
    "absolute w-64 rounded-xl border border-border bg-surface p-3.5 shadow-lg",

  // Toggled based on whether we've measured a position yet — avoids a
  // flash at (0,0) before useLayoutEffect runs. Split out from `popover`
  // so top/left (still inline, since they're computed at runtime) are the
  // only thing left in the style attribute.
  popoverVisible: "visible",
  popoverHidden: "invisible",

  headerRow: "flex items-start justify-between gap-2",

  identitySection: "min-w-0 flex-1",
  nameRow: "flex items-center gap-1.5",
  name: "text-h2 text-ink truncate",
  positionRow: "mt-1 flex items-center gap-1.5",
  position: "text-body-sm text-muted",

  editInputWrap: "flex flex-col",
  counter:
    "text-[10px] leading-none text-faint text-right pointer-events-none select-none mt-1",

  editIconButton:
    "flex-shrink-0 text-muted hover:text-ink cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed",

  nameInput:
    "text-h2 text-ink bg-surface border border-border rounded-md px-1.5 py-0.5 w-full focus:outline-none focus:ring-2 focus:ring-accent-border focus:border-accent",
  positionInput:
    "text-body-sm text-muted bg-surface border border-border rounded-md px-1.5 py-0.5 w-24 focus:outline-none focus:ring-2 focus:ring-accent-border focus:border-accent",

  errorText: "text-caption text-danger mt-1",

  deleteButton:
    "absolute bottom-2 right-2 text-muted hover:text-danger cursor-pointer transition-colors",

  jerseyWrapper: "flex-shrink-0",

  jerseyContainer: "relative inline-block",

  jerseyPath: "stroke-ink stroke-[3] [stroke-linejoin:round]",

  numberText: "cursor-pointer hover:opacity-80 transition-opacity",

  numberInput:
    "absolute inset-0 w-full h-full bg-transparent text-center font-bold text-ink focus:outline-none pointer-events-auto",

  notesTextarea:
    "mt-3 w-full h-20 resize-none rounded-md border border-border bg-surface p-2 text-caption text-ink-2 placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent-border focus:border-accent",
};
