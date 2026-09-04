export const sidebarStyles = {
  // Arrow button visible when sidebar is collapsed (desktop only — mobile uses
  // the toolbar toggle in page.tsx).
  openButton:
    "hidden lg:block fixed top-20 left-0 z-40 bg-surface border border-l-0 border-border rounded-r-lg p-2 shadow-md hover:bg-surface-subtle transition-colors",
  openButtonIcon: "h-5 w-5 text-muted",

  // Backdrop behind the mobile drawer (below lg only).
  backdrop: "fixed inset-0 z-40 bg-ink/40 lg:hidden",

  // Below lg: off-canvas drawer sliding in from the left over a backdrop.
  // At lg+: the original in-flow collapsible column (width toggles between
  // sidebarOpen / sidebarClosed), rendering identically to before. A clean
  // white surface panel on the cream paper background.
  sidebar:
    "fixed inset-y-0 left-0 z-50 w-[85vw] max-w-sm rounded-r-lg shadow-lg transition-transform duration-300 ease-in-out overflow-hidden overflow-y-auto bg-surface border border-border lg:static lg:inset-auto lg:z-auto lg:h-full lg:max-w-none lg:shadow-sm lg:flex-shrink-0 lg:translate-x-0 lg:transition-[width]",
  sidebarOpen: "translate-x-0 lg:w-80",
  sidebarClosed: "-translate-x-full lg:w-0",

  // Fixed-width wrapper — prevents content from reflowing during animation
  innerWrapper: "w-full min-w-72 p-4",

  // Header row — tab switcher and the close button share one row.
  header: "flex items-center gap-2 mb-5",
  closeButton:
    "flex-shrink-0 p-1 rounded-md hover:bg-surface-subtle transition-colors",
  closeButtonIcon: "h-5 w-5 text-muted",

  // Tab switcher — a modern segmented control. The active tab reads as a raised
  // pill on the recessed track; inactive tabs are quiet until hovered.
  tabList:
    "flex flex-1 items-center gap-1 p-1 rounded-lg bg-surface-subtle border border-border",
  tabButton:
    "flex flex-1 items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-body-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-border",
  tabButtonActive: "bg-surface text-ink shadow-sm",
  tabButtonInactive: "text-muted hover:text-ink",
  tabIcon: "h-4 w-4",

  // Placeholder copy shown by tabs that have no controls yet.
  emptyState:
    "flex items-center justify-center rounded-lg border border-dashed border-border px-4 py-10 text-center text-body-sm text-muted",

  // Fields section
  manageSection: "mt-3 pt-3 border-t border-border space-y-5",
  fieldGroup: "flex flex-col gap-1",
  sectionTitle: "text-h3 text-ink",
  selectWrapper: "relative",
  textInput:
    "w-full px-3 py-2 text-body-sm text-ink bg-surface border border-border rounded-md placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent-border focus:border-accent",
  selectInput:
    "w-full appearance-none bg-surface px-3 py-2 pr-10 text-body-sm text-ink border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-border focus:border-accent cursor-pointer",
  customArrowIcon:
    "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted",

  // Custom game dropdown (replaces the native <select> so each game can carry a
  // delete button — currently selected game can't be deleted).
  gameSelectButton:
    "flex w-full items-center justify-between bg-surface px-3 py-2 text-body-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-border focus:border-accent cursor-pointer",
  gameSelectButtonLabel: "truncate text-left text-ink",
  gameSelectButtonIcon: "h-4 w-4 flex-shrink-0 text-muted",
  gameSelectMenu:
    "absolute left-0 right-0 top-full z-10 mt-1 max-h-60 overflow-y-auto rounded-lg border border-border bg-surface py-1 shadow-lg",
  gameSelectOption:
    "group flex items-center justify-between gap-2 px-3 py-2 text-body-sm hover:bg-surface-subtle",
  gameSelectOptionActive: "bg-accent-subtle font-semibold",
  gameSelectOptionLabel: "flex-1 truncate text-left text-ink",
  // Inline rename input — sits in place of the label while editing a game.
  gameSelectEditInput:
    "flex-1 min-w-0 bg-surface px-1.5 py-0.5 text-body-sm text-ink border border-accent rounded focus:outline-none focus:ring-2 focus:ring-accent-border",
  gameSelectEditButton:
    "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-faint hover:bg-accent-subtle hover:text-accent transition-colors",
  gameSelectDeleteButton:
    "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-faint hover:bg-danger-fill hover:text-danger transition-colors",
  textArea:
    "w-full px-3 py-2 text-body-sm text-ink bg-surface border border-border rounded-md resize-y min-h-[80px] placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent-border focus:border-accent",

  fieldCounter:
    "self-end text-[10px] leading-none text-faint pointer-events-none select-none mt-0.5",

  errorText: "text-caption text-danger mt-1",
  extraSectionText: "text-caption text-muted",

  // Create Game Button
  createGameButton:
    "mt-2 flex items-center gap-1.5 text-body-sm font-semibold text-accent hover:text-accent-hover disabled:opacity-50 disabled:cursor-not-allowed",
  createGamePlus:
    "flex h-5 w-5 items-center justify-center rounded-full border-2 border-accent bg-transparent text-accent",

  // Save Notes button
  saveNotesButton:
    "mt-2 self-start rounded-md bg-accent px-3 py-1.5 text-caption font-semibold text-white hover:bg-accent-hover disabled:opacity-50",

  // Toasts
  toastSuccess:
    "fixed bottom-6 left-1/2 -translate-x-1/2 text-body-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg z-50 bg-ink text-white",
  toastError:
    "fixed bottom-6 left-1/2 -translate-x-1/2 text-body-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg z-50 bg-danger text-white",

  // Rule tooltip
  ruleTooltip:
    "absolute bottom-full left-0 mb-1 w-full min-w-64 rounded-lg border border-border bg-surface p-2 text-caption text-ink-2 shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-150 pointer-events-none z-10",
};
