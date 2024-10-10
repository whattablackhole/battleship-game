import { Room } from "./interfaces/room";
import { User } from "./interfaces/user";

export const db = {
  users: new Map<number, User>([[1, { id: 1, name: "vasya", password: "good" }]]),
  rooms: new Map<number, Room>([
    [
      1,
      {
        roomId: 1,
        roomUsers: [
          {
            name: "vasya",
            index: 2,
          },
        ],
      },
    ],
    [
      2,
      {
        roomId: 2,
        roomUsers: [
          {
            name: "kolya",
            index: 3,
          },
        ],
      },
    ],
  ]),
};


