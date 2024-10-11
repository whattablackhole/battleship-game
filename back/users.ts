import { db } from "./db.js";
import { LoginUserMessage } from "./interfaces/messages.js";

import { LoginResponseMessage, User } from "./interfaces/user.js";

export class UsersManager {
  getUserByIndex(index: number): User {
    return db.users.get(index);
  }
  login(
    message: LoginUserMessage,
    connectionIndex: number
  ): LoginResponseMessage {
    const dbUser: User = {
      index: connectionIndex,
      name: message.data.name,
      password: message.data.password,
    };

    db.users.set(connectionIndex, dbUser);

    return {
      data: {
        name: message.data.name,
        error: false,
        errorText: "",
        index: connectionIndex,
      },
      id: 0,
      type: "reg",
    };
  }
}
