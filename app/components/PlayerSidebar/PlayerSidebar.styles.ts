export const playerSidebarStyles = {
  // Arrow button visible when sidebar is collapsed (desktop only — mobile uses
  // the toolbar toggle in page.tsx).
  openButton:
    "hidden lg:block fixed top-20 right-0 z-40 bg-surface border border-r-0 border-border rounded-l-lg p-2 shadow-md hover:bg-surface-subtle transition-colors",
  openButtonIcon: "h-5 w-5 text-muted",

  // Backdrop behind the mobile drawer (below lg only).
  backdrop: "fixed inset-0 z-40 bg-ink/40 lg:hidden",

  // Below lg: off-canvas drawer sliding in from the right over a backdrop.
  // At lg+: the original in-flow collapsible column (width toggles between
  // sidebarOpen / sidebarClosed), rendering identically to before. A clean
  // white surface panel on the cream paper background.
  sidebar:
    "fixed inset-y-0 right-0 z-50 w-[85vw] max-w-sm rounded-l-lg shadow-lg transition-transform duration-300 ease-in-out overflow-hidden overflow-y-auto bg-surface border border-border lg:static lg:inset-auto lg:z-auto lg:h-full lg:max-w-none lg:shadow-sm lg:flex-shrink-0 lg:translate-x-0 lg:transition-[width]",
  sidebarOpen: "translate-x-0 lg:w-80",
  sidebarClosed: "translate-x-full lg:w-0",

  // Fixed-width wrapper — prevents content from reflowing during animation
  innerWrapper: "w-full min-w-72 p-4 flex h-full flex-col",

  // Header row
  header: "relative flex items-center justify-center mb-2",
  title: "text-h2 text-ink",
  closeButton:
    "absolute left-0 p-1 rounded-md hover:bg-surface-subtle transition-colors",
  closeButtonIcon: "h-5 w-5 text-muted",

  // Player List
  playerListAside:
    "w-full flex-1 min-h-0 bg-surface px-4 pt-2 pb-0 flex flex-col overflow-y-auto max-h-[87%]",
  playerListAsideIsOver: "ring-2 ring-accent rounded-lg",
  playerListGrid: "grid grid-cols-2 gap-3",
  playerListSkeleton:
    "aspect-square rounded-xl bg-surface-subtle animate-pulse",
  playerListCreateButton:
    "bg-surface-subtle rounded-xl flex flex-col items-center justify-center gap-1 aspect-square hover:bg-border transition-colors",
  playerListCreateIcon: "h-20 w-20 sm:h-12 sm:w-12 md:h-14 md:w-14 text-faint",
  playerListCreateLabel: "text-lg sm:text-sm text-muted",

  // Create Player Modal
  createModalTitle: "text-h2 text-ink mb-4",
  createModalForm: "space-y-4",
  createModalLabel: "block text-label text-ink-2 mb-1",
  createModalInput:
    "w-full rounded-md border border-border bg-surface px-3 py-2 pr-9 text-body-sm text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent-border focus:border-accent",
  createModalInputWrap: "relative",
  createModalCounter:
    "absolute right-2 bottom-0.5 text-[10px] leading-none text-faint pointer-events-none select-none",
  createModalError: "text-body-sm text-danger mt-1",
  createModalActions: "flex justify-end gap-2",
  createModalCancelButton:
    "rounded-md px-4 py-2 text-body-sm font-medium text-ink-2 hover:bg-surface-subtle transition-colors",
  createModalSubmitButton:
    "rounded-md bg-accent px-4 py-2 text-body-sm font-medium text-white hover:bg-accent-hover transition-colors",

  // Bench All Players Button
  sendAllButton:
    "mt-auto mb-1 w-2/3 mx-auto rounded-md bg-accent px-4 py-1 text-white font-semibold shadow-sm hover:bg-accent-hover transition-colors",
};
