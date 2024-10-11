import { Room } from "./room.js";
import { Ship } from "./ship.js";

export class Message {
  type: string;
  data: unknown;
  id = 0;

  constructor(type: string, data: string) {
    this.type = type;
    this.data = data;
  }
}
export interface StartGameMessage extends Message {
  id: 0;
  type: "start_game";
  data: StartGameData;
}
export interface StartGameData {
  currentPlayerIndex: number;
  ships: Ship[];
}



export interface AddUserMessage extends Message {
  id: 0;
  type: "add_user_to_room";
  data: AddUserData;
}
export interface AddUserData {
  indexRoom: number;
}

export interface CreateGameMessage extends Message {
  type: "create_game";
  data: {
    idGame: number;
    idPlayer: number;
  };
  id: 0;
}

export interface CreateRoomMessage extends Message {
  id: 0;
  data: "";
  type: "create_room";
}

export interface AddShipsMessage extends Message {
  type: "add_ships";
  data: {
    gameId: number;
    ships: Ship[];
    indexPlayer: number;
  };
}

export interface UpdateRoomMessage extends Message {
  type: "update_room";
  data: Room[];
}

export interface CreateGameData {
  idGame: number;
  idPlayer: number;
}

export interface LoginUserMessage extends Message {
  data: {
    name: string;
    password: string;
  };
}
