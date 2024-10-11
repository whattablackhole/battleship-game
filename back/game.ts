import { db } from "./db.js";
import { GameStatus, PlayersStateStatus } from "./interfaces/game.js";
import {
  AddShipsMessage,
  AttackMessage,
  AttackResponseMessage,
  CreateGameMessage,
  FinishGameMessage,
  PlayerTurnMessage,
  RandomAttackMessage,
  StartGameMessage,
} from "./interfaces/messages.js";
import { RoomUser } from "./interfaces/room.js";

export class GameManager {
  private gameIndex = 0;

  public createGame(users: RoomUser[]): CreateGameMessage[] {
    const players = users.map((u) => ({ index: u.index, ships: [] }));
    const gameID = this.gameIndex;
    const game = {
      id: gameID,
      players,
      status: GameStatus.Deliver,
      state: {
        currentPlayer: players[Math.round(Math.random())].index,
        playerState: new Map([
          [
            players[0].index,
            { playerGameGridState: [], status: PlayersStateStatus.Deliver },
          ],
          [
            players[1].index,
            { playerGameGridState: [], status: PlayersStateStatus.Deliver },
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
    game.state.playerState.get(player.index).status = PlayersStateStatus.Ready;
    return {
      gameId: game.id,
      isReady: game.state.playerState
        .values()
        .every(({ status }) => status === PlayersStateStatus.Ready),
    };
  }

  public getPlayerTurn(gameId: number): PlayerTurnMessage {
    const playerIndex = db.games.get(gameId).state.currentPlayer;
    return {
      data: { currentPlayer: playerIndex },
      id: 0,
      type: "turn",
    };
  }

  public finishGame(gameId: number): FinishGameMessage {
    const game = db.games.get(gameId);

    game.status = GameStatus.Fininished;

    return {
      data: { winPlayer: game.state.winner },
      id: 0,
      type: "finish",
    };
  }

  public startGame(gameId: number): StartGameMessage[] {
    const game = db.games.get(gameId);
    const messages: StartGameMessage[] = [];

    game.players.forEach((player) => {
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
      player.ships.forEach((ship, shipIndex) => {
        let x = ship.position.x;
        let y = ship.position.y;
        if (!ship.direction) {
          for (let i = x; i < x + ship.length; i++) {
            playerGameGridState[i][y] = shipIndex + 1;
          }
        } else {
          for (let i = y; i < y + ship.length; i++) {
            playerGameGridState[x][i] = shipIndex + 1;
          }
        }
      });

      const playerState = game.state.playerState.get(player.index);
      playerState.playerGameGridState = playerGameGridState;
      playerState.status = PlayersStateStatus.Ready;

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

  public getPlayersByGameId(gameId: number) {
    return db.games.get(gameId).players;
  }

  public handleRandomAttack(msg: RandomAttackMessage) {
    const x = Math.round(Math.random() * 9);
    const y = Math.round(Math.random() * 9);

    const attack: AttackMessage = {
      ...msg,
      data: {
        ...msg.data,
        x,
        y,
      },
      type: "attack",
    };
    return this.handleAttack(attack);
  }

  public handleAttack(msg: AttackMessage): {
    gameOver: boolean;
    attackResponseMessage: AttackResponseMessage;
  } {
    const game = db.games.get(msg.data.gameId);

    const [nextPlayerIndex, state] = game.state.playerState
      .entries()
      .find(([index]) => index !== msg.data.indexPlayer);

    const attackedCell = state.playerGameGridState[msg.data.x][msg.data.y];
    let kill = true;
    let gameOver = true;
    let shot = true;

    if (attackedCell <= 0) {
      kill = false;
      gameOver = false;
      shot = false;
    } else {
      state.playerGameGridState[msg.data.x][msg.data.y] = 0;

      state.playerGameGridState.forEach((row) => {
        row.forEach((cell) => {
          if (cell > 0) {
            gameOver = false;
          }
          if (cell === attackedCell) {
            kill = false;
          }
        });
      });
    }

    if (!shot) {
      game.state.currentPlayer = nextPlayerIndex;
    } else if (gameOver) {
      game.state.winner = msg.data.indexPlayer;
    }

    return {
      gameOver,
      attackResponseMessage: {
        data: {
          currentPlayer: msg.data.indexPlayer,
          position: {
            x: msg.data.x,
            y: msg.data.y,
          },
          status: kill ? "killed" : shot ? "shot" : "miss",
        },
        type: "attack",
        id: 0,
      },
    };
  }
}
