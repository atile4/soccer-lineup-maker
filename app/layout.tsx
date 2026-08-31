import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { Caveat, Inter } from "next/font/google";

// context providers
import { AuthProvider } from "@/context/AuthContext";
import { TeamProvider } from "@/context/TeamContext";
import { GameProvider } from "@/context/GameContext";
import { PlayerSizeProvider } from "@/context/PlayerSizeContext";
import { RulesetWarningsProvider } from "@/context/RulesetWarningsContext";
import { COOKIE_NAME, parseScale } from "@/context/playerSize";

export const metadata: Metadata = {
  title: "Soccer Lineup Organizer",
  description: "Create and manage soccer team lineups",
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const caveat = Caveat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-caveat",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read the saved token-size preference from the cookie on the server so the
  // correct size renders on first paint (avoids a flash to the default).
  const initialScale = parseScale(cookies().get(COOKIE_NAME)?.value);

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${caveat.variable} ${inter.className}`}
      >
        <AuthProvider>
          <TeamProvider>
            <GameProvider>
              <PlayerSizeProvider initialScale={initialScale}>
                <RulesetWarningsProvider>{children}</RulesetWarningsProvider>
              </PlayerSizeProvider>
            </GameProvider>
          </TeamProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
