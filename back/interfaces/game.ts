export enum GameStatus {
  "waiting_for_ship_delivery",
  "ready",
  "play",
}
export enum PlayersStateStatus {
  "ready",
  "not_ready",
}

export interface Game {
  id: number;
  players: number[];
  status: GameStatus;
  state: {
    playerState: Map<
      number,
      { status: PlayersStateStatus; playerGameGridState: number[][] }
    >;
  };
}
