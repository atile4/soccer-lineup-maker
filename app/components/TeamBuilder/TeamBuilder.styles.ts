// TeamBuilder styles — fully reconciled onto the global token system
// (globals.css :root + tailwind.config.js). Previously this file carried its
// own CSS-variable theme (notebook/turf) injected as inline styles; that
// indirection is gone — utilities now reference the shared Tailwind tokens
// directly (bg-paper, text-ink, border-border, bg-accent, …).
export const teamBuilderStyles = {
  page: "min-h-full bg-paper text-ink-2",
  container: "max-w-[1180px] mx-auto px-4 pt-6 pb-24",

  headingRow: "flex items-end justify-between gap-4 flex-wrap mb-5",
  title: "text-display",
  headingActions: "flex items-center gap-3",
  playerCountLabel: "text-body-sm text-muted",
  saveButton:
    "px-5 py-2.5 text-body-sm font-semibold text-white bg-accent rounded-lg shadow-sm hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors",

  grid: "grid grid-cols-1 md:grid-cols-[340px_1fr] gap-5 items-start",

  // Left card: team details
  detailsCard:
    "bg-surface border border-border rounded-xl shadow-sm p-5 md:sticky md:top-4",
  cardTitle: "text-h3 mb-4 flex items-center gap-2",
  cardIcon:
    "w-6 h-6 rounded-md bg-surface-subtle flex items-center justify-center text-accent flex-shrink-0",

  // Jersey preview badge
  jerseyPreview:
    "flex items-center gap-3.5 p-3.5 bg-paper border border-dashed border-border rounded-lg mb-4",
  jerseyPreviewName: "text-h3 text-ink truncate",
  jerseyPreviewMeta: "text-caption text-muted mt-0.5",

  fieldLabel: "block text-label mb-1.5",
  textInput:
    "w-full px-3 py-2.5 pr-10 text-body-sm text-ink bg-surface border border-border rounded-md mb-4 placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent-border focus:border-accent",
  selectWrapper: "relative mb-4",
  selectInput:
    "w-full appearance-none px-3 py-2.5 pr-9 text-body-sm text-ink bg-surface border border-border rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-border focus:border-accent",
  selectChevron:
    "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted",

  // Gender segmented control
  segmentedGroup:
    "grid grid-cols-3 gap-1.5 bg-surface-subtle p-1 rounded-lg mb-4",
  segmentedOption:
    "py-2 text-caption font-semibold rounded-md border-none cursor-pointer transition-colors",
  segmentedOptionActive: "bg-surface text-accent shadow-sm",
  segmentedOptionInactive: "bg-transparent text-muted",

  // Color swatches
  swatchGrid: "grid grid-cols-6 gap-2 mb-2.5",
  swatch: "aspect-square rounded-md border-2 cursor-pointer",
  swatchActive: "ring-2 ring-offset-2 ring-accent",
  customColorRow: "flex items-center gap-2.5",
  customColorLabel:
    "inline-flex items-center gap-2 text-caption text-muted cursor-pointer",
  customColorInput:
    "w-8 h-8 p-0 border border-border rounded-md bg-transparent cursor-pointer",
  customColorValue: "text-caption text-muted tabular-nums",

  // Right column
  rightCol: "flex flex-col gap-4 min-w-0",

  addCard: "bg-surface border border-border rounded-xl shadow-sm p-4",
  addCardTitle: "text-h3 mb-3",
  addCardHint: "text-caption text-muted mb-3",
  sectionLabel: "block text-caption font-bold text-muted uppercase tracking-wide mb-2",
  importBlock: "pb-3 mb-3 border-b border-border",
  importButtons: "grid grid-cols-1 sm:grid-cols-2 gap-2",
  importButton:
    "flex items-center justify-center gap-1.5 px-3 py-2 text-caption font-semibold text-ink bg-surface-subtle border border-border rounded-md hover:bg-paper transition-colors",
  manualBlock: "",
  addForm:
    "grid grid-cols-2 sm:grid-cols-[1fr_78px_1.2fr_auto] gap-2.5 items-end",
  formField: "flex flex-col gap-1",
  formLabel: "text-caption font-semibold text-muted",
  formInputWrap: "relative",
  formInput:
    "w-full px-2.5 py-2 pr-10 text-body-sm text-ink bg-surface border border-border rounded-md placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent-border focus:border-accent",
  formInputCenter: "text-center",
  formCounter:
    "absolute right-2 bottom-0.5 text-[10px] leading-none text-faint pointer-events-none select-none",
  addButton:
    "px-4 h-[38px] text-body-sm font-semibold text-white bg-accent rounded-md shadow-sm hover:bg-accent-hover whitespace-nowrap transition-colors",

  dupeWarning:
    "flex items-center gap-2.5 px-3.5 py-2.5 bg-danger-fill border border-danger-border rounded-lg",
  dupeWarningText: "text-body-sm font-semibold text-danger",

  rosterCard:
    "bg-surface border border-border rounded-xl shadow-sm overflow-hidden",
  rosterHeader:
    "flex items-center justify-between px-4 py-3 border-b border-border",
  rosterTitle: "text-h3",
  rosterCount:
    "text-caption font-semibold text-muted bg-surface-subtle px-2.5 py-1 rounded-full",

  emptyState: "px-5 py-10 text-center",
  emptyIcon:
    "w-12 h-12 mx-auto mb-3 rounded-lg bg-surface-subtle flex items-center justify-center text-accent",
  emptyTitle: "text-body-sm font-semibold text-ink",
  emptySubtitle: "text-caption text-muted mt-1",

  rosterList: "list-none m-0 p-1.5",
  rosterRow: "flex items-center gap-3 px-3 py-2.5 rounded-lg",
  rosterRowDupe: "bg-danger-fill ring-1 ring-inset ring-danger-border",
  numberBadge:
    "w-9 h-9 rounded-full flex items-center justify-center text-body-sm font-bold flex-shrink-0 bg-surface-subtle text-ink",
  rosterName: "text-body-sm font-semibold text-ink truncate",
  rosterSub: "text-caption text-muted mt-0.5",
  positionChip:
    "text-caption font-bold text-accent bg-surface-subtle px-2.5 py-1 rounded-full flex-shrink-0",
  deleteButton:
    "w-8 h-8 flex items-center justify-center text-muted rounded-md hover:bg-danger-fill hover:text-danger transition-colors flex-shrink-0",

  toast:
    "fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink text-white text-body-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg z-50",
};
