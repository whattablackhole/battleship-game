import { Room } from "./room.js";
import { Position, Ship } from "./ship.js";

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
  type: "start_game";
  data: StartGameData;
}
export interface StartGameData {
  currentPlayerIndex: number;
  ships: Ship[];
}

export interface PlayerTurnMessage extends Message {
  data: { currentPlayer: number };
}

export interface AttackMessage extends Message {
  type: "attack";
  data: {
    gameId: number;
    x: number;
    y: number;
    indexPlayer: number;
  };
}

export interface RandomAttackMessage extends Message {
  type: "randomAttack";
  data: {
    gameId: number;
    indexPlayer: number;
  };
}

export interface AttackResponseMessage extends Message {
  type: "attack";
  data: {
    position: Position;
    currentPlayer: number;
    status: "miss" | "killed" | "shot";
  };
}

export interface FinishGameMessage extends Message {
  type: "finish";
  data: {
    winPlayer: number;
  };
}

export interface AddUserMessage extends Message {
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
}

export interface CreateRoomMessage extends Message {
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

export interface LoginUserMessage extends Message {
  data: {
    name: string;
    password: string;
  };
}

export interface LoginResponseMessage {
  data: {
    name: string;
    error: boolean;
    errorText: string;
    index: number;
  };
  id: 0;
  type: "reg";
}

export interface WinnersData {
  name: string;
  wins: number;
}

export interface UpdateWinnersMessage {
  type: "update_winners";
  data: WinnersData[];
  id: 0;
}
