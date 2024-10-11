import WebSocket, { WebSocketServer } from "ws";
import { UsersManager } from "./users.js";
import { SERVER_SETTINGS } from "./server-settings.js";
import { RoomManager } from "./rooms.js";
import {
  LoginUserMessage,
  Message,
  UpdateRoomMessage,
} from "./interfaces/messages.js";

export class App {
  private connections = new Map<WebSocket, number>();

  constructor(
    private usersManager: UsersManager = new UsersManager(),
    private roomsManager = new RoomManager()
  ) {}

  public update_rooms(): UpdateRoomMessage {
    const rooms = this.roomsManager.getFreeRooms();

    const message = {
      id: 0,
      data: rooms,
      type: "update_room" as const,
    };

    return message;
  }

  public serve() {
    const wss = new WebSocketServer(SERVER_SETTINGS);

    wss.on("connection", (ws) => {
      let user_index: number | null = null;

      ws.on("error", console.error);

      ws.on("message", (data) => {
        const request: Message = JSON.parse(data.toString());

        switch (request.type) {
          case "reg":
            const message: LoginUserMessage = (request.data = JSON.parse(
              request.data as string
            ));
            const response = this.usersManager.login(message);
            ws.send(
              JSON.stringify({
                ...response,
                data: JSON.stringify(response.data),
              })
            );
            ws.send(JSON.stringify(this.update_rooms()));
            break;
          case "add_user_to_room":
            console.log();
            break;
          case "add_ships":
            console.log();
            break;
          case "randomAttack":
            break;
          case "create_room":
            break;
        }
      });
    });
  }
}

const app = new App();
app.serve();
