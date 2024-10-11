import { db } from "./db.js";
import { UpdateRoomMessage } from "./interfaces/messages.js";
import { Room, RoomUser } from "./interfaces/room.js";
import { User } from "./interfaces/user.js";

export class RoomManager {
  private index = 0;

  public createRoomAndAddSelf(user: User): boolean {
    if (
      db.rooms
        .values()
        .some((r) => r.roomUsers.some((r) => r.index === user.index))
    ) {
      throw new Error("Invalid action");
    }
    const room: Room = { roomId: this.index, roomUsers: [] };
    db.rooms.set(this.index, room);
    const index = this.index;
    this.index++;
    return this.addUserToRoom(user, index);
  }

  public updateRooms(): UpdateRoomMessage {
    const rooms = this.getFreeRooms();

    const message = {
      id: 0,
      data: rooms,
      type: "update_room" as const,
    };

    return message;
  }

  public getRoomUsers(roomIndex: number): RoomUser[] {
    return db.rooms.get(roomIndex).roomUsers;
  }

  public addUserToRoom(user: User, roomIndex: number): boolean {
    const room = db.rooms.get(roomIndex);

    if (room.roomUsers.some((u) => u.index === user.index)) {
      return false;
    }

    if (!room) {
      throw new Error("No room found.");
    }

    if (room.roomUsers.length > 1) {
      throw new Error("Room is full.");
    }

    room.roomUsers.push({ index: user.index, name: user.name });

    return room.roomUsers.length === 2;
  }

  public getFreeRooms(): Room[] {
    return db.rooms
      .values()
      .filter((r) => {
        return r.roomUsers.length < 2;
      })
      .toArray();
  }
}
