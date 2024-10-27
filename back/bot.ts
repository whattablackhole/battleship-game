import { AttackMessage } from "./interfaces/messages";
import { Position, Ship } from "./interfaces/ship";

export class BotManager {
  index = -1;
  bots: Map<number, Bot> = new Map();

  createBot(): Bot {
    const bot = new Bot(this.index);
    this.bots.set(this.index, bot);
    this.index--;
    return bot;
  }

  getBot(id: number): Bot {
    return this.bots.get(id);
  }
}

export class Bot {
  id: number;
  gameId: number;
  lastResult: "hit" | "shot" | "miss" | "killed" = "miss";
  validAttacks = this.genRandomValidAttacks();
  ships: Ship[];

  constructor(id: number) {
    this.id = id;
    this.ships = this.genRandomShips();
  }

  attack() {
    const position = this.validAttacks.pop();

    const msg: AttackMessage = {
      type: "attack",
      id: 0,
      data: {
        gameId: this.gameId,
        indexPlayer: this.id,
        x: position.x,
        y: position.y,
      },
    };
    return msg;
  }

  private genRandomValidAttacks() {
    const attacks = [];
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        attacks.push({ x, y });
      }
    }
    attacks.sort(() => Math.random() - 0.5);
    return attacks;
  }

  private genRandomShips(): Ship[] {
    let shipsCfg = [
      {
        length: 4,
        type: "huge",
        amount: 1,
      },
      {
        length: 3,
        type: "large",
        amount: 2,
      },
      {
        length: 2,
        type: "medium",
        amount: 3,
      },
      {
        length: 1,
        type: "small",
        amount: 4,
      },
    ];
    const playerGameGridState: number[][] = [
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    ];

    const fitShip = (
      row: number,
      col: number,
      direction: boolean,
      length: number
    ): boolean => {
      const isCellFree = (r: number, c: number): boolean => {
        return (
          (playerGameGridState[r]?.[c] ?? 1) === -1 &&
          (playerGameGridState[r + 1]?.[c] ?? -1) === -1 &&
          (playerGameGridState[r - 1]?.[c] ?? -1) === -1 &&
          (playerGameGridState[r]?.[c + 1] ?? -1) === -1 &&
          (playerGameGridState[r]?.[c - 1] ?? -1) === -1 &&
          (playerGameGridState[r + 1]?.[c + 1] ?? -1) === -1 &&
          (playerGameGridState[r - 1]?.[c + 1] ?? -1) === -1 &&
          (playerGameGridState[r + 1]?.[c - 1] ?? -1) === -1 &&
          (playerGameGridState[r - 1]?.[c - 1] ?? -1) === -1
        );
      };

      for (let i = 0; i < length; i++) {
        if (direction) {
          if (!isCellFree(row, col + i)) {
            return false;
          }
        } else {
          if (!isCellFree(row + i, col)) {
            return false;
          }
        }
      }

      return true;
    };

    const markPosition = (
      row: number,
      col: number,
      direction: boolean,
      length: number
    ) => {
      for (let i = 0; i < length; i++) {
        if (direction) {
          playerGameGridState[row][col + i] = 1;
        } else {
          playerGameGridState[row + i][col] = 1;
        }
      }
    };

    const ships = shipsCfg
      .map((shipCfg) => {
        const ships = [];
        for (let i = 0; i < shipCfg.amount; i++) {
          let validPositions: Position[] = [];
          let direction = Boolean(Math.round(Math.random()));
          playerGameGridState.forEach((r, ri) => {
            r.forEach((_, ci) => {
              if (fitShip(ri, ci, direction, shipCfg.length)) {
                validPositions.push({ x: ri, y: ci });
              }
            });
          });
          const position =
            validPositions[Math.round(Math.random() * validPositions.length)];
          markPosition(position.x, position.y, direction, shipCfg.length);

          ships.push({
            type: shipCfg.type,
            direction,
            length: shipCfg.length,
            position,
          } as Ship);
        }
        return ships;
      })
      .flat();

    return ships;
  }
}
