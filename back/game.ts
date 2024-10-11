import { db } from "./db";
import { Game, GameStatus, PlayersStateStatus } from "./interfaces/game";
import { AddShipsMessage } from "./interfaces/messages";
import { User } from "./interfaces/user";

export class BattleShip {
  public createGame(players: User[]): Game {
    const ids = players.map((p) => p.id);
    const gameID = db.games.size;
    const game = {
      id: gameID,
      players: ids,
      status: GameStatus.waiting_for_ship_delivery,
      state: {
        status: "ready",
        playerState: new Map([
          [
            ids[0],
            { playerGameGridState: [], status: PlayersStateStatus.not_ready },
          ],
          [
            ids[1],
            { playerGameGridState: [], status: PlayersStateStatus.not_ready },
          ],
        ]),
      },
    };

    db.games.set(gameID, game);

    return game;
  }

  public addShips(message: AddShipsMessage) {
    const playerGameGridState: number[][] = [
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    ];

    message.data.ships.forEach((ship, index) => {
      let x = ship.position.x;
      let y = ship.position.y;
      // ship.direction
      // ship.length
      // ship.position 4 3
      if (ship.direction) {
        // true = x false = y
        for (let i = x; i < x + ship.length; i++) {
          playerGameGridState[y][x] = index + 1;
        }
      } else {
        for (let i = y; i < y + ship.length; i++) {
          playerGameGridState[y][x] = index + 1;
        }
      }
    });

    const playerState = db.games
      .get(message.data.gameId)
      .state.playerState.get(message.data.indexPlayer);
    playerState.playerGameGridState = playerGameGridState;
    playerState.status = PlayersStateStatus.ready;
  }
}
