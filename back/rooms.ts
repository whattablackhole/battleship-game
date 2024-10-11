import { db } from "./db.js";
import { CreateRoomMessage } from "./interfaces/messages.js";
import { Room } from "./interfaces/room.js";

export class RoomManager {
  public createRoom(message: CreateRoomMessage) {
    const roomIndex = db.rooms.size;
    db.rooms.set(roomIndex, { roomId: roomIndex, roomUsers: [] });
  }

  public addUserToRoom(
    user: { name: string; index: number },
    roomIndex: number
  ) {
    const room = db.rooms.get(roomIndex);

    if (!room) {
      throw new Error("No room found.");
    }

    if (room.roomUsers.length > 1) {
      throw new Error("Room is full.");
    }

    room.roomUsers.push(user);

    return room.roomUsers.length === 2
  }

  public getFreeRooms(): Room[] {
    return db.rooms
      .values()
      .filter((r) => {
        return r.roomUsers.length === 1;
      })
      .toArray();
  }
}
