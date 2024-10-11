import WebSocket, { WebSocketServer } from "ws";
import { UsersManager } from "./users.js";
import { SERVER_SETTINGS } from "./server-settings.js";
import { RoomManager } from "./rooms.js";
import {
  AddShipsMessage,
  AddUserMessage,
  AttackMessage,
  FinishGameMessage,
  LoginUserMessage,
  Message,
  PlayerTurnMessage,
  RandomAttackMessage,
} from "./interfaces/messages.js";
import { GameManager } from "./game.js";

export class BattleShipApp {
  private connections = new Map<WebSocket, number>();
  private connectionIndex = 1;

  constructor(
    private usersManager: UsersManager = new UsersManager(),
    private roomsManager = new RoomManager(),
    private gamesManager = new GameManager()
  ) {}

  serializeMessage(message: Message): string {
    message.data = JSON.stringify(message.data);
    return JSON.stringify(message);
  }

  deserializeMessage(data: WebSocket.RawData): Message {
    const message = JSON.parse(data.toString());
    try {
      message.data = JSON.parse(message.data);
    } catch {
      message.data = "";
    }

    return message;
  }

  getConnectionByIndex(connectionIndex: number): WebSocket {
    return this.connections.entries().find(([ws, index]) => {
      return index === connectionIndex;
    })[0];
  }

  public serve() {
    const wss = new WebSocketServer(SERVER_SETTINGS);

    wss.on("connection", (ws) => {
      this.connections.set(ws, this.connectionIndex);
      this.connectionIndex++;
      ws.on("error", console.error);

      ws.on("message", (data) => {
        const msg = this.deserializeMessage(data);
        switch (msg.type) {
          case "reg": {
            const responseMessage = this.usersManager.login(
              msg as LoginUserMessage,
              this.connections.get(ws)
            );
            ws.send(this.serializeMessage(responseMessage));
            const rooms = this.roomsManager.update_rooms();
            ws.send(this.serializeMessage(rooms));
            break;
          }

          case "add_user_to_room": {
            const userIndex = this.connections.get(ws);
            const user = this.usersManager.getUserByIndex(userIndex);
            this.roomsManager.addUserToRoom(
              user,
              (msg as AddUserMessage).data.indexRoom
            );
            const rooms = this.roomsManager.update_rooms();
            const users = this.roomsManager.getRoomUsers(
              (msg as AddUserMessage).data.indexRoom
            );
            const messages = this.gamesManager.createGame(users);

            messages.forEach((m) => {
              const connection = this.getConnectionByIndex(m.data.idPlayer);
              connection.send(this.serializeMessage(m));
            });

            this.connections.forEach((_, connection) => {
              connection.send(this.serializeMessage(rooms));
            });

            break;
          }

          case "add_ships": {
            const message = msg as AddShipsMessage;
            const gameStatus = this.gamesManager.addShips(message);
            if (gameStatus.isReady) {
              const startGameMessages = this.gamesManager.startGame(
                gameStatus.gameId
              );
              const turnMessage = this.gamesManager.getPlayerTurn(
                gameStatus.gameId
              );
              const players = this.gamesManager.getPlayersByGameId(
                gameStatus.gameId
              );
              const turnData = this.serializeMessage(turnMessage);

              players.forEach((player) => {
                const connection = this.getConnectionByIndex(player.index);

                const startGameMessage = startGameMessages.find(
                  (m) => m.data.currentPlayerIndex === player.index
                );

                connection.send(this.serializeMessage(startGameMessage));
                connection.send(turnData);
              });
            }
            break;
          }

          case "attack": {
            const message = msg as AttackMessage;
            const { attackResponseMessage, gameOver } =
              this.gamesManager.handleAttack(message);
            const players = this.gamesManager.getPlayersByGameId(
              message.data.gameId
            );

            let gameStateMessage: PlayerTurnMessage | FinishGameMessage;

            if (gameOver) {
              gameStateMessage = this.gamesManager.finishGame(
                message.data.gameId
              );
            } else {
              gameStateMessage = this.gamesManager.getPlayerTurn(
                message.data.gameId
              );
            }
            const curr = this.getConnectionByIndex(message.data.indexPlayer);
            const attackData = this.serializeMessage(attackResponseMessage);
            const gameStateData = this.serializeMessage(gameStateMessage);
            players.forEach((p) => {
              const connection = this.getConnectionByIndex(p.index);
              connection.send(attackData);

              connection.send(gameStateData);
            });
            break;
          }

          case "randomAttack": {
            const message = msg as RandomAttackMessage;
            const { attackResponseMessage, gameOver } =
              this.gamesManager.handleRandomAttack(message);
            const players = this.gamesManager.getPlayersByGameId(
              message.data.gameId
            );

            let gameStateMessage: PlayerTurnMessage | FinishGameMessage;

            if (gameOver) {
              gameStateMessage = this.gamesManager.finishGame(
                message.data.gameId
              );
            } else {
              gameStateMessage = this.gamesManager.getPlayerTurn(
                message.data.gameId
              );
            }
            const attackData = this.serializeMessage(attackResponseMessage);
            const gameStateData = this.serializeMessage(gameStateMessage);
            players.forEach((p) => {
              const connection = this.getConnectionByIndex(p.index);
              connection.send(attackData);
              connection.send(gameStateData);
            });
            break;
          }

          case "create_room":
            const roomIndex = this.roomsManager.createRoom();
            const userIndex = this.connections.get(ws);
            const user = this.usersManager.getUserByIndex(userIndex);
            this.roomsManager.addUserToRoom(user, roomIndex);
            const rooms = this.roomsManager.update_rooms();
            const message = this.serializeMessage(rooms);
            this.connections.forEach((_, ws) => {
              ws.send(message);
            });
            break;
        }
      });
    });
  }
}

const app = new BattleShipApp();
app.serve();
