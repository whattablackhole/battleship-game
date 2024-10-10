import { Ship } from "./ship";

export interface StartGameData {
  gameId: number;
  currentPlayerIndex: number | string;
  ships: Ship[];
}

export interface AddUserData {
  indexRoom: number | string;
}

export interface CreateRoomMessage {
    id: 0,
    data: "",
    type: "create_room"
}

export interface AddShipsData {
  gameId: number | string;
  ships: Ship[];
  indexPlayer: number | string;
}

export interface UpdateRoomData {
  roomId: number;
  roomUsers: [
    {
      name: string;
      index: number;
    }
  ];
}

export interface CreateGameData {
  idGame: number;
  idPlayer: number;
}

export interface LoginUserData {
    name: string;
    password: string;
}




