export interface Ship {
  position: Position;
  direction: boolean;
  length: number;
  type: "small" | "medium" | "large" | "huge";
}

export interface Position {
  x: number;
  y: number;
}
