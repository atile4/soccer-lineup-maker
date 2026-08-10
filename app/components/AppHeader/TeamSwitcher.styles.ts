export const teamSwitcherStyles = {
  wrapper: "relative inline-block",

  // Trigger button — shows the *current* team
  trigger:
    "flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors text-left",

  swatch: "w-8 h-8 rounded-full border-2 border-white/70 flex-shrink-0",

  triggerText: "flex flex-col leading-tight min-w-0",
  triggerName:
    "text-body-sm font-semibold text-white truncate max-w-[8rem] sm:max-w-[10rem]",
  triggerMeta: "hidden sm:block text-caption text-white/70 truncate max-w-[10rem]",

  chevron:
    "h-4 w-4 text-white/80 transition-transform duration-150 flex-shrink-0",
  chevronOpen: "rotate-180",

  // Empty state — shown when the user has no teams yet
  emptyTrigger:
    "flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors text-left",
  emptyIconWrap:
    "w-8 h-8 rounded-full border-2 border-dashed border-white/70 flex items-center justify-center flex-shrink-0 text-white",
  emptyIcon: "h-4 w-4",
  emptyText: "text-body-sm font-semibold text-white",

  // Dropdown panel — lists every team with the same details
  dropdown:
    "absolute right-0 mt-2 w-72 rounded-lg border border-border bg-surface shadow-lg z-50 py-1 max-h-80 overflow-y-auto",

  // Row wrapper — holds the select button and (for non-selected teams) a delete button
  optionRow:
    "group/row relative flex items-center hover:bg-surface-subtle transition-colors",
  optionRowSelected: "bg-accent-subtle hover:bg-accent-subtle",

  option: "flex-1 flex items-center gap-3 px-3 py-2.5 text-left min-w-0",

  optionText: "flex flex-col leading-tight min-w-0 flex-1",
  optionName: "text-body-sm font-semibold text-ink truncate",
  optionMeta: "text-caption text-muted truncate",

  checkIcon: "h-4 w-4 text-accent flex-shrink-0 mr-3",

  // Delete button — revealed on row hover, hidden for the active team
  deleteButton:
    "mr-2 flex-shrink-0 rounded-md p-1.5 text-faint opacity-0 group-hover/row:opacity-100 focus:opacity-100 hover:bg-danger-fill hover:text-danger transition-colors",
  deleteIcon: "h-4 w-4",

  // Divider + "Create team" row
  divider: "my-1 border-t border-border",
  createOptionWrap: "relative",
  createOption:
    "w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-subtle transition-colors text-left",
  createIconWrap:
    "w-8 h-8 rounded-full border-2 border-dashed border-accent-border flex items-center justify-center flex-shrink-0 text-accent",
  createIcon: "h-4 w-4",
  createText: "text-body-sm font-semibold text-accent",

  // Warning popover — shown when the team limit is reached
  limitPopover:
    "absolute bottom-full right-0 mb-2 w-56 rounded-lg border border-border bg-surface px-3 py-2 shadow-lg z-10 text-caption text-danger",
};
