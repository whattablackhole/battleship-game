export interface Room {
  roomId: number;
  roomUsers: {
    name: string;
    index: number;
  }[];
}
