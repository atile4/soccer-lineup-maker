"use client";

import AppHeader from "../components/AppHeader/AppHeader";
import { aboutStyles as s } from "./about.styles";

export default function AboutPage() {
  return (
    <div className={s.page}>
      <AppHeader page={"about"} />
      <main className={s.main}>
        <div className={s.container}>
          <p className={s.overline}>Soccer Lineup Organizer</p>
          <h1 className={s.title}>About</h1>
          <p className={s.subtitle}>
            Hi, my name is {"<atile>"}. Currently, {"I'm"} a 2nd year computer
            science student at UC Irvine, and a little over 3 years under my
            belt coaching U8, U10, and U12 AYSO teams. More relevantly, {"I'm"}{" "}
            the developer behind this website, SLO.
          </p>
          <p className={s.subtitle}>
            I built SLO as a lineup-building tool for soccer coaches,
            specifically in the AYSO ruleset format. This means that it supports
            team-building for players, and allows you to create lineups for
            mutiple games while keeping the same players, split by halves or
            quarters for the convenience of coaches.
          </p>
          <p className={s.subtitle}>
            Currently, Soccer Lineup Organizer is still a work in progress.
            Alongside prepping for jobs and studying for school, updates may be
            slow. Even so, I hope to make SLO the best I can make it be, and I
            hope you can be patient with me as I work on it.
          </p>
          <p className={s.subtitle}>
            If you have any questions, comments, or concerns, feel free to reach
            out to me at{" "}
            <a href="mailto:atticus1467@gmail.com" className={s.link}>
              atticus1467@gmail.com
            </a>{" "}
            or create a{" "}
            <a
              href="https://github.com/atile4/soccer-lineup-organizer/issues"
              className={s.link}
            >
              GitHub issue
            </a>
            .
          </p>
          <p className={s.subtitle}>
            Again, many thanks for supporting Soccer Lineup Organizer!
          </p>
          <p className={s.subtitle}>- atile </p>
        </div>
      </main>
    </div>
  );
}
