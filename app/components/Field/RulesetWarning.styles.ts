// Amber "advisory" styling, distinct from the red `danger` used by destructive
// UI elsewhere — a ruleset warning flags a lineup that needs attention, not an
// error. Tokens are defined in app/globals.css.
export const rulesetWarningStyles = {
  buttonWrapper: "absolute right-full bottom-10 mr-2 group",
  buttonWarning:
    "bg-warning-fill text-warning border-warning-border hover:bg-warning-fill",

  tooltip:
    "absolute right-0 bottom-full mb-2 w-48 rounded-lg border border-border bg-surface p-2.5 text-caption text-ink-2 shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-150 pointer-events-none",
  tooltipHint: "mt-1 text-muted",

  badge:
    "absolute -top-1.5 -right-1.5 min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-warning text-white text-[0.625rem] font-bold leading-none flex items-center justify-center tabular-nums",

  // Popover chrome
  overlay: "fixed inset-0 z-50",

  popover:
    "absolute w-80 rounded-xl border border-warning-border bg-surface p-4 shadow-lg",
  popoverVisible: "visible",
  popoverHidden: "invisible",

  list: "mt-0 flex max-h-80 flex-col gap-2 overflow-y-auto",
  item: "rounded-lg border border-warning-border bg-warning-fill px-3 py-2.5",
  itemHeader: "flex items-center gap-1.5",
  itemIcon: "shrink-0 text-warning",
  itemPlayer: "text-body-sm font-semibold text-ink",
  itemRule: "ml-auto text-caption text-warning",
  itemMessage: "mt-1 text-caption leading-snug text-ink-2",

  // Clean state
  clear: "mt-0 flex items-center gap-2 text-body-sm text-ink-2",
  clearIcon: "shrink-0 text-accent",

  footnote: "mt-4 border-t border-border pt-3 text-caption text-muted",
};
