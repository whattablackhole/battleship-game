import WebSocket, { WebSocketServer } from "ws";
import { UsersManager } from "./users.js";
import { Message } from "./interfaces/message.js";
import { SERVER_SETTINGS } from "./server-settings.js";
import { RoomManager } from "./rooms.js";

export class App {
  private connections = new Map<WebSocket, number>();

  constructor(
    private usersManager: UsersManager = new UsersManager(),
    private roomsManager = new RoomManager()
  ) {}

  public update_rooms() {
    const rooms = this.roomsManager.getFreeRooms();
    const message = {
      id: 0,
      data: JSON.stringify(rooms),
      type: "update_room",
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
            const response = this.usersManager.login(request);
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
