import { Room } from "./room";
import { Ship } from "./ship";

export class Message {
  type: string;
  data: unknown;
  id = 0;

  constructor(type: string, data: string) {
    this.type = type;
    this.data = data;
  }
}

export interface StartGameData {
  gameId: number;
  currentPlayerIndex: number | string;
  ships: Ship[];
}

export interface AddUserData {
  indexRoom: number | string;
}

export interface CreateGameMessage extends Message {
  type: "create_game";
  data: {
    idGame: number | string;
    idPlayer: number | string;
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
