"use client";

import { useRouter } from "next/navigation";

import { appHeaderStyles as styles } from "./appHeader.styles";

interface LogoAndTitleProps {
  title?: string;
}

export default function LogoAndTitle({
  title = "Soccer Lineup Organizer",
}: LogoAndTitleProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/")}
      className={`${styles.centerSection.wrapper} cursor-pointer transition-opacity text-left`}
      aria-label="Go to home page"
    >
      <div className={styles.logo.container}>
        <svg
          className={styles.logo.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a10 10 0 0 0 0 20" />
          <path d="M12 2a10 10 0 0 1 0 20" />
          <path d="M2 12h20" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      </div>

      <div className="text-center min-w-0">
        <h1 className={styles.text.title}>{title}</h1>
      </div>
    </button>
  );
}
