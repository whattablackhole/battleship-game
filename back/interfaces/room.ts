export interface Room {
  roomId: number;
  roomUsers: RoomUser[];
}

export interface RoomUser {
  name: string;
  index: number;
}
