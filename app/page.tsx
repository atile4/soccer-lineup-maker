"use client";

import { useEffect, useState } from "react";
import { PanelLeft, Users } from "lucide-react";

// hooks
import { useTeam } from "@/context/TeamContext";
import { useGame } from "@/context/GameContext";
import { useIsDesktop } from "./hooks/useIsDesktop";

// drag-and-drop
import { DndProvider } from "react-dnd";
import { MultiBackend } from "react-dnd-multi-backend";
import { HTML5toTouch } from "rdndmb-html5-to-touch";
import { CustomDragLayer } from "./components/dnd/CustomDragLayer";

// context
import { LineupProvider } from "@/context/LineupContext";
import { PlayerInfoProvider } from "@/context/PlayerInfoContext";

// Components
import AppHeader from "./components/AppHeader/AppHeader";
import ManageSidebar from "./components/ManageSidebar/ManageSidebar";
import PlayerSidebar from "./components/PlayerSidebar/PlayerSidebar";
import Bench from "./components/Bench/Bench";
import { Field } from "./components/Field/Field";
import FieldSizeControl from "./components/Field/FieldSizeControl";
import LineupTabs from "./components/LineupTabs/LineupTabs";

export default function DashboardPage() {
  const { currentTeamId, loading: teamLoading } = useTeam();
  const { currentGame, loading: gameLoading } = useGame();

  const appReady = !teamLoading && !gameLoading;

  // Sidebar open state is lifted here so the mobile toolbar toggles and the
  // desktop collapse chevrons drive the same source of truth. On desktop the
  // columns default open; on mobile the drawers default closed.
  const isDesktop = useIsDesktop();
  const [manageOpen, setManageOpen] = useState(true);
  const [playersOpen, setPlayersOpen] = useState(true);

  useEffect(() => {
    setManageOpen(isDesktop);
    setPlayersOpen(isDesktop);
  }, [isDesktop]);

  return (
    <div className="min-h-screen lg:h-screen flex flex-col">
      <AppHeader page={"dash"} />
      {!appReady ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      ) : (
        <DndProvider backend={MultiBackend} options={HTML5toTouch}>
          <CustomDragLayer />
          <LineupProvider
            teamId={currentTeamId}
            lineupId={currentGame?.current_lineup_id ?? null}
          >
            <PlayerInfoProvider>
              {/* Mobile-only toolbar to open each drawer */}
              <div className="lg:hidden flex items-center gap-2 px-4 py-2 border-b border-[#e8e0c8] bg-[#fdf8e3]">
                <button
                  type="button"
                  onClick={() => setManageOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-[#e8e0c8] bg-[#fefcf3] px-3 py-1.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-[#f5edd4] transition-colors"
                >
                  <PanelLeft className="h-4 w-4" />
                  Manage
                </button>
                <button
                  type="button"
                  onClick={() => setPlayersOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-[#e8e0c8] bg-[#fefcf3] px-3 py-1.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-[#f5edd4] transition-colors"
                >
                  <Users className="h-4 w-4" />
                  Players
                </button>
              </div>

              <main className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden py-4 gap-4">
                <ManageSidebar
                  teamId={currentTeamId}
                  open={manageOpen}
                  onOpenChange={setManageOpen}
                  isDesktop={isDesktop}
                />

                {/* Soccer Field zone — field-first, stacks vertically on mobile */}
                <div className="flex-1 flex flex-col lg:flex-row lg:items-center lg:justify-center lg:h-full w-full min-w-0 px-2 lg:px-4">
                  <div className="flex flex-col items-center lg:flex-row lg:items-start lg:h-full gap-3 lg:gap-4 w-full lg:w-auto">
                    {/* Lineup period tabs — above the field on mobile, left on desktop */}
                    <LineupTabs />

                    <div className="flex flex-col items-center lg:flex-row lg:items-start lg:h-full gap-3 lg:gap-4 w-full lg:w-auto">
                      <div className="relative">
                        <FieldSizeControl className="absolute right-full bottom-0 mr-2" />
                        <Field />
                      </div>
                      <Bench />
                    </div>
                  </div>
                </div>

                <PlayerSidebar
                  open={playersOpen}
                  onOpenChange={setPlayersOpen}
                  isDesktop={isDesktop}
                />
              </main>
            </PlayerInfoProvider>
          </LineupProvider>
        </DndProvider>
      )}
    </div>
  );
}
