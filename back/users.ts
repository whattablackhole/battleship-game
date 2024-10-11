import { db } from "./db.js";
import { LoginUserMessage } from "./interfaces/messages.js";

import { LoginResponseMessage, User } from "./interfaces/user.js";

export class UsersManager {
  login(message: LoginUserMessage): LoginResponseMessage {
    const index = db.users.size;

    const dbUser: User = {
      id: index,
      name: message.data.name,
      password: message.data.password,
    };

    db.users.set(index, dbUser);

    return {
      data: {
        name: message.data.name,
        error: false,
        errorText: "",
        index,
      },
      id: 0,
      type: "reg",
    };
  }
}
