import { Game } from "./interfaces/game.js";
import { Room } from "./interfaces/room.js";
import { User } from "./interfaces/user.js";

export const db = {
  users: new Map<number, User>(),
  rooms: new Map<number, Room>(),
  games: new Map<number, Game>(),
};
