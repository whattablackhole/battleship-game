import { db } from "./db.js";
import {
  LoginResponseMessage,
  LoginUserMessage,
} from "./interfaces/messages.js";

import { User } from "./interfaces/user.js";

export class UsersManager {
  getUserByIndex(index: number): User {
    return db.users.get(index);
  }
  login(
    message: LoginUserMessage,
    connectionIndex: number
  ): LoginResponseMessage {
    try {
      this.validateUsername(message.data.name);
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
    } catch (err) {
      return {
        data: {
          name: message.data.name,
          error: true,
          errorText: err.message,
          index: connectionIndex,
        },
        id: 0,
        type: "reg",
      };
    }
  }

  private validateUsername(name: string) {
    if (!/^[A-Za-z0-9\u0400-\u04FF]{5,30}$/.test(name)) {
      throw new Error(
        `Name must contain no less than 5 alphanumeric characters with maximum length of 30 chars`
      );
    }
    const duplicateName = db.users.values().some((u) => {
      return u.name === name;
    });
    if (duplicateName) {
      throw new Error(
        `User with such name already exists. Please provide another one.`
      );
    }
  }
}
