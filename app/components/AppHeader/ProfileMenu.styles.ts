export const popoverStyles = {
  container:
    "absolute right-0 mt-2 w-64 rounded-lg border border-border bg-surface shadow-lg z-50",

  // Header section
  header: "px-4 py-3 border-b border-border flex items-center gap-3",
  headerName: "text-body-sm font-semibold text-ink",
  headerEmail: "text-caption text-muted mt-0.5",

  // Menu items
  menuItem:
    "flex items-center space-x-3 px-4 py-3 hover:bg-surface-subtle transition-colors cursor-pointer",
  menuIcon: "w-5 h-5 text-muted",
  menuText: "text-body-sm font-medium text-ink-2",

  // Logout item
  logoutItem:
    "flex items-center space-x-3 px-4 py-3 border-t border-border hover:bg-danger-fill transition-colors cursor-pointer",
  logoutIcon: "w-5 h-5 text-danger",
  logoutText: "text-body-sm font-medium text-danger",

  // AYSO ruleset warnings section
  rulesetWarningsSection:
    "flex items-center justify-between gap-3 px-4 py-3 border-t border-border",
  rulesetWarningsTitle: "text-body-sm text-ink",
  rulesetWarningsDescription: "text-caption text-muted mt-0.5",
  rulesetWarningsToggle:
    "relative inline-flex h-5 w-10 items-center rounded-full focus:outline-none",
  rulesetWarningsTrack:
    "group relative inline-flex h-5 w-10 items-center rounded-full bg-muted transition-colors data-[enabled=true]:bg-accent",
  rulesetWarningsThumb:
    "absolute left-0 h-5 w-5 rounded-full bg-surface shadow-sm transition-transform group-data-[enabled=true]:translate-x-5",
};

export const buttonStyles = {
  container:
    "flex items-center space-x-2 px-2 py-2 rounded-md hover:bg-white/10 transition-colors",
  avatar:
    "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm bg-white text-accent",
  userName: "text-body-sm font-medium text-ink-2",
  chevron: "w-4 h-4 text-muted transition-transform",
};
