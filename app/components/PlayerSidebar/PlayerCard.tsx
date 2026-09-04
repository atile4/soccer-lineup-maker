import PlayerToken from "./PlayerToken";
import { playerCardStyles as styles } from "./PlayerCard.styles";

type PlayerCardProps = {
  name: string;
  number: number | null;
  jerseyColor?: string; // jersey fill color
  nameColor?: string; // player name text color
};

// The sidebar card: a PlayerToken wrapped in the rounded gray background.
// On the field the token is rendered on its own (see FieldPlayer), which is how
// the background gets "removed" once a player is placed.
export default function PlayerCard({
  name,
  number,
  jerseyColor,
  nameColor,
}: PlayerCardProps) {
  return (
    <div className={styles.card}>
      <PlayerToken
        name={name}
        number={number}
        jerseyColor={jerseyColor}
        nameColor={nameColor}
      />
    </div>
  );
}
