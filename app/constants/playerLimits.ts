/**
	@TODO
	implement warnings for AYSO "everybody plays" rule
	1. The Golden Rule: No player may play a full 4 quarters unless every 
			other teammate on the roster has played at least 3 quarters.
	2. U10: A player can play goalkeeper for a maximum of 2 quarters per game.
	3. U12: A player can play goalkeeper for a maximum of 3 quarters per game.
	*/

// Maximum players on field (according to AYSO guidelines)
export const MAX_PLAYERS = 11;

// Character limits for player fields
export const MAX_PLAYER_NAME_CHARS = 25;
export const MAX_PLAYER_NUMBER_CHARS = 2;
export const MAX_PLAYER_POSITION_CHARS = 15;
export const MAX_TEAM_NAME_CHARS = 20;

export const MAX_PLAYERS_BY_DIV = {
  u8: 4,
  u10: 7,
  u12: 9,
  u14: 11,
  u16: 11,
  u18: 11,
};

// Maximum teams per account
export const MAX_TEAMS = 2;

// Maximum games per team
export const MAX_GAMES = 3;
