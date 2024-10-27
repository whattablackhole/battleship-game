import { Game } from "./interfaces/game.js";
import { Room } from "./interfaces/room.js";
import { User } from "./interfaces/user.js";

export const db = {
  users: new Map<number, User>([
    // Uncomment for fast test
    // [0, { index: 0, name: "vasya", password: "wewewe" }],
  ]),
  rooms: new Map<number, Room>(),
  games: new Map<number, Game>([
    // Uncomment for fast test
    // [
    //   0,
    //   {
    //     id: 0,
    //     players: [],
    //     state: { currentPlayer: 0, playerState: new Map(), winner: 0 },
    //     status: 3,
    //   },
    // ],
    // [
    //   1,
    //   {
    //     id: 1,
    //     players: [],
    //     state: { currentPlayer: 0, playerState: new Map(), winner: 0 },
    //     status: 3,
    //   },
    // ],
  ]),
};
