import WebSocket, { WebSocketServer } from "ws";
import { UsersManager } from "./users.js";
import { SERVER_SETTINGS } from "./server-settings.js";
import { RoomManager } from "./rooms.js";
import {
  AddShipsMessage,
  AddUserMessage,
  AttackMessage,
  AttackResponseMessage,
  FinishGameMessage,
  LoginUserMessage,
  Message,
  PlayerTurnMessage,
  RandomAttackMessage,
} from "./interfaces/messages.js";
import { GameManager } from "./game.js";
import { Bot, BotManager } from "./bot.js";

export class BattleShipApp {
  private connections = new Map<WebSocket, number>();
  private connectionIndex = 1;
  private wss: WebSocketServer;
  constructor(
    private usersManager: UsersManager = new UsersManager(),
    private roomsManager = new RoomManager(),
    private gamesManager = new GameManager(),
    private botsManager = new BotManager()
  ) {}

  private serializeMessage(message: Message): string {
    message.data = JSON.stringify(message.data);
    return JSON.stringify(message);
  }

  private deserializeMessage(data: WebSocket.RawData): Message {
    const message = JSON.parse(data.toString());
    try {
      message.data = JSON.parse(message.data);
    } catch {
      message.data = "";
    }

    return message;
  }

  private getConnectionByIndex(connectionIndex: number): WebSocket {
    return this.connections.entries().find(([ws, index]) => {
      return index === connectionIndex;
    })[0];
  }

  private handleBotAction(gameId: number, botId: number) {
    const bot = this.botsManager.getBot(botId);

    let attackResponseMessage, gameOver;
    while (
      this.gamesManager.getPlayerTurn(gameId).data.currentPlayer < 0 &&
      !gameOver
    ) {
      const request = bot.attack();
      ({ attackResponseMessage, gameOver } =
        this.gamesManager.handleAttack(request));
      const players = this.gamesManager.getPlayersByGameId(gameId);

      let gameStateMessage: PlayerTurnMessage | FinishGameMessage;

      if (gameOver) {
        gameStateMessage = this.gamesManager.finishGame(gameId);
      } else {
        gameStateMessage = this.gamesManager.getPlayerTurn(gameId);
      }
      const attackData = this.serializeMessage(attackResponseMessage);
      const gameStateData = this.serializeMessage(gameStateMessage);

      players
        .filter((p) => p.index > 0)
        .forEach((p) => {
          const connection = this.getConnectionByIndex(p.index);
          connection.send(attackData);

          connection.send(gameStateData);
        });
    }
  }

  public serve() {
    const wss = new WebSocketServer(SERVER_SETTINGS);
    this.wss = wss;

    process.on("SIGINT", app.cleanup);
    process.on("SIGTERM", app.cleanup);

    console.log(
      `Websocket parameters: ${JSON.stringify(wss.options, null, "\t")}`
    );

    wss.on("connection", (ws) => {
      ws.on("error", console.error);
      ws.once("close", () => {
        const userID = this.connections.get(ws);
        this.connections.delete(ws);
        // NOTE: Do clean up for user id if needed by requirements...
      });
      ws.on("message", (data) => {
        const msg = this.deserializeMessage(data);

        console.log(`Received command: ${msg.type}`);

        switch (msg.type) {
          case "reg": {
            const responseMessage = this.usersManager.login(
              msg as LoginUserMessage,
              this.connectionIndex
            );

            if (!responseMessage.data.error) {
              this.connections.set(ws, this.connectionIndex);
              this.connectionIndex++;
            }

            ws.send(this.serializeMessage(responseMessage));
            const rooms = this.roomsManager.updateRooms();
            const winnersStatistics = this.gamesManager.getWinnersStatistics();
            ws.send(this.serializeMessage(winnersStatistics));
            ws.send(this.serializeMessage(rooms));
            console.log(
              `Command result: ${JSON.stringify(responseMessage, null, "\t")}`
            );
            console.log(`${JSON.stringify(rooms, null, "\t")}`);
            console.log(`${JSON.stringify(winnersStatistics, null, "\t")}`);
            break;
          }

          case "add_user_to_room": {
            const userIndex = this.connections.get(ws);
            const user = this.usersManager.getUserByIndex(userIndex);
            const ready = this.roomsManager.addUserToRoom(
              user,
              (msg as AddUserMessage).data.indexRoom
            );

            if (!ready) {
              console.log(
                `Command result: Ignore. Can't add user that is already there.`
              );
              break;
            }

            const rooms = this.roomsManager.updateRooms();
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
            console.log(
              `Command result: ${JSON.stringify(messages, null, "\t")}`
            );
            console.log(`${JSON.stringify(rooms, null, "\t")}`);
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

              players
                .filter((p) => p.index > 0)
                .forEach((player) => {
                  const connection = this.getConnectionByIndex(player.index);

                  const startGameMessage = startGameMessages.find(
                    (m) => m.data.currentPlayerIndex === player.index
                  );

                  connection.send(this.serializeMessage(startGameMessage));
                  connection.send(turnData);
                });

              console.log(
                `Command result: ${JSON.stringify(
                  startGameMessages,
                  null,
                  "\t"
                )}`
              );
              console.log(`${JSON.stringify(turnMessage, null, "\t")}`);
            }
            break;
          }

          case "attack": {
            const message = msg as AttackMessage;
            let attackResponseMessage: AttackResponseMessage, gameOver: boolean;

            try {
              ({ attackResponseMessage, gameOver } =
                this.gamesManager.handleAttack(message));
            } catch {
              break;
            }

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

            players
              .filter((p) => p.index > 0)
              .forEach((p) => {
                const connection = this.getConnectionByIndex(p.index);
                connection.send(attackData);

                connection.send(gameStateData);
              });

            if (gameOver) {
              const winnersStatistics = this.serializeMessage(
                this.gamesManager.getWinnersStatistics()
              );
              this.connections.forEach((_, c) => {
                c.send(winnersStatistics);
              });
            } else {
              const turn = this.gamesManager.getPlayerTurn(message.data.gameId);
              if (!gameOver && turn.data.currentPlayer < 0) {
                this.handleBotAction(
                  message.data.gameId,
                  turn.data.currentPlayer
                );
              }
            }

            console.log(
              `Command result: ${JSON.stringify(
                attackResponseMessage,
                null,
                "\t"
              )}`
            );
            console.log(`${JSON.stringify(gameStateMessage, null, "\t")}`);
            break;
          }

          case "randomAttack": {
            const message = msg as RandomAttackMessage;
            let attackResponseMessage: AttackResponseMessage, gameOver: boolean;

            try {
              ({ attackResponseMessage, gameOver } =
                this.gamesManager.handleRandomAttack(message));
            } catch {
              break;
            }
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

            players
              .filter((p) => p.index > 0)
              .forEach((p) => {
                const connection = this.getConnectionByIndex(p.index);
                connection.send(attackData);
                connection.send(gameStateData);
              });

            if (gameOver) {
              const winnersStatistics = this.serializeMessage(
                this.gamesManager.getWinnersStatistics()
              );
              this.connections.forEach((_, c) => {
                c.send(winnersStatistics);
              });
            } else {
              const turn = this.gamesManager.getPlayerTurn(message.data.gameId);
              if (!gameOver && turn.data.currentPlayer < 0) {
               this.handleBotAction(message.data.gameId,turn.data.currentPlayer);
              }
            }

            console.log(
              `Command result: ${JSON.stringify(
                attackResponseMessage,
                null,
                "\t"
              )}`
            );
            console.log(`${JSON.stringify(gameStateMessage, null, "\t")}`);
            break;
          }

          case "single_play":
            const userIndex = this.connections.get(ws);
            const botPlayer = this.botsManager.createBot();

            const user = this.usersManager.getUserByIndex(userIndex);
            const message = this.gamesManager.createSinglePlay(user, botPlayer);

            ws.send(this.serializeMessage(message));
            break;
          case "create_room":
            try {
              const userIndex = this.connections.get(ws);
              const user = this.usersManager.getUserByIndex(userIndex);
              this.roomsManager.createRoomAndAddSelf(user);
              const rooms = this.roomsManager.updateRooms();
              const message = this.serializeMessage(rooms);
              this.connections.forEach((_, ws) => {
                ws.send(message);
              });
              console.log(
                `Command result: ${JSON.stringify(rooms, null, "\t")}`
              );
            } catch {
              console.log(`Command result: Failed`);
            } finally {
              break;
            }
        }
      });
    });
  }
  public cleanup = () => {
    console.log("Cleaning up before exit...");
    this.connections.forEach((_, client) => {
      client.terminate();
    });
    this.wss.close(() => {
      console.log("WebSocket server closed");
      process.exit(0);
    });
  };
}

const app = new BattleShipApp();
app.serve();
