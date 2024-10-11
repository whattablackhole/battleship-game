import { Ship } from "./ship";

export enum GameStatus {
  Deliver,
  Ready,
  Play,
  Fininished,
}
export enum PlayersStateStatus {
  Ready,
  Deliver,
}

export interface Game {
  id: number;
  players: { index: number; ships: Ship[] }[];
  status: GameStatus;
  state: {
    winner?: number;
    currentPlayer: number;
    playerState: Map<
      number,
      { status: PlayersStateStatus; playerGameGridState: number[][] }
    >;
  };
}
