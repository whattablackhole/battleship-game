import { db } from "./db.js";
import { Game, GameStatus, PlayersStateStatus } from "./interfaces/game.js";
import {
  AddShipsMessage,
  CreateGameMessage,
  StartGameMessage,
} from "./interfaces/messages.js";
import { RoomUser } from "./interfaces/room.js";

export class GameManager {
  private gameIndex = 0;

  public createGame(users: RoomUser[]): CreateGameMessage[] {
    console.log(db.users);
    const players = users.map((u) => ({ index: u.index, ships: [] }));
    const gameID = this.gameIndex;
    const game = {
      id: gameID,
      players,
      status: GameStatus.waiting_for_ship_delivery,
      state: {
        playerState: new Map([
          [
            players[0].index,
            { playerGameGridState: [], status: PlayersStateStatus.not_ready },
          ],
          [
            players[1].index,
            { playerGameGridState: [], status: PlayersStateStatus.not_ready },
          ],
        ]),
      },
    };
    this.gameIndex++;
    db.games.set(gameID, game);

    return game.players.map((p) => {
      return {
        id: 0,
        data: { idGame: gameID, idPlayer: p.index },
        type: "create_game",
      };
    });
  }

  public addShips(message: AddShipsMessage): {
    gameId: number;
    isReady: boolean;
  } {
    const game = db.games.get(message.data.gameId);
    const player = game.players.find(
      (p) => p.index === message.data.indexPlayer
    );
    player.ships = message.data.ships;
    game.state.playerState.get(player.index).status = PlayersStateStatus.ready;
    return {
      gameId: game.id,
      isReady: game.state.playerState
        .values()
        .every(({ status }) => status === PlayersStateStatus.ready),
    };
  }

  //   public getPlayerTurn(gameId: number): PlayerTurnMessage {
  //     {
  //         type: "turn",
  //         data:
  //             {
  //                 currentPlayer: <number | string>, /* id of the player in the current game session */
  //             },
  //         id: 0,
  //     }
  //   }

  public startGame(gameId: number): StartGameMessage[] {
    const game = db.games.get(gameId);
    const messages: StartGameMessage[] = [];

    game.players.forEach((player, index) => {
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
      player.ships.forEach((ship) => {
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

      const playerState = game.state.playerState.get(player.index);
      playerState.playerGameGridState = playerGameGridState;
      playerState.status = PlayersStateStatus.ready;

      messages.push({
        type: "start_game" as const,
        id: 0,
        data: {
          ships: player.ships,
          currentPlayerIndex: player.index,
        },
      });
    });
    return messages;
  }
}
