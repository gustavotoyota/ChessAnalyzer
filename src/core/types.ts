import { Move } from "chess.js";

export interface MoveScore {
  mate: boolean;
  score: number;
}

export interface ChessLine extends MoveScore {
  moves: Move[];
  scoreText: string;
}
