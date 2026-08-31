"use client";

import { appHeaderStyles as styles } from "./appHeader.styles";

// Context
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Components
import ProfileMenu from "./ProfileMenu";
import LogoAndTitle from "./LogoAndTitle";
import TeamSwitcher from "./TeamSwitcher";
import { Button } from "../ui/Button";

interface AppHeaderProps {
  page: string;
}

export default function AppHeader({ page = "dash" }: AppHeaderProps) {
  const { session, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <header className={styles.header.container}>
      <div className={styles.header.inner}>
        <div className={styles.header.layout}>
          <LogoAndTitle title={"SLO"} />

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className={`${styles.user.wrapper} flex items-center gap-3`}>
              {session && page == "dash" && <TeamSwitcher />}

              {session ? (
                <ProfileMenu onLogout={handleLogout} />
              ) : (
                <Button
                  type="button"
                  variant="outline-accent"
                  onClick={handleLogin}
                  aria-label="Log in"
                >
                  Log in
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
