import { db } from "./db.js";
import {
  LoginUserData,
} from "./interfaces/data.js";
import { Message } from "./interfaces/message.js";

import { LoginResponseMessage, User } from "./interfaces/user.js";

export class UsersManager {
  login(request: Message): LoginResponseMessage {
    const index = db.users.size;

    const user: LoginUserData = JSON.parse(request.data);

    const dbUser: User = {
      id: index,
      name: user.name,
      password: user.password,
    };

    db.users.set(index, dbUser);

    return {
      data: {
        name: user.name,
        error: false,
        errorText: "",
        index,
      },
      id: 0,
      type: "reg",
    };
  }
}
