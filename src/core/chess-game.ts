import { Chess, Move, Piece, Square } from "chess.js";

import { getFensFromMoves, getGameFromMoves, getStartingFen } from "./utils";

type ChessGameEventType = "update" | "move";

export class ChessGame {
  private _game: Chess;

  private _startingFen: string;

  private _moveHistory: Move[] = [];
  private _fenHistory: string[] = [];
  private _moveIndex = -1;

  private _customMoveHistory: Move[] = [];
  private _customFenHistory: string[] = [];
  private _customMoveIndex = -1;

  private _listeners = new Map<string, Set<(...args: any[]) => void>>();

  constructor(game?: Chess | string) {
    this._game =
      typeof game === "string" ? new Chess(game) : game ?? new Chess();

    this._startingFen = this._game.fen();
  }

  get game() {
    return this._game;
  }

  get startingFen() {
    return this._startingFen;
  }

  get moveHistory() {
    return this._moveHistory;
  }
  get fenHistory() {
    return this._fenHistory;
  }
  get moveIndex() {
    return this._moveIndex;
  }

  get customMoveHistory() {
    return this._customMoveHistory;
  }
  get customFenHistory() {
    return this._customFenHistory;
  }
  get customMoveIndex() {
    return this._customMoveIndex;
  }

  get finalMoveHistory() {
    return this._moveHistory.concat(this._customMoveHistory);
  }
  get finalFenHistory() {
    return this._fenHistory.concat(this._customFenHistory);
  }
  get finalMoveIndex() {
    return this._moveIndex + this._customMoveIndex + 1;
  }

  get fen() {
    return this._game.fen();
  }
  get pgn() {
    return this._game.pgn({ maxWidth: 30, newline: "\n" });
  }

  get finalPgn() {
    return getGameFromMoves(this._startingFen, this.finalMoveHistory).pgn({
      maxWidth: 30,
      newline: "\n",
    });
  }

  get turn() {
    return this._game.turn();
  }

  get(square: Square): Piece {
    return this._game.get(square);
  }

  private _resetHistory() {
    this._startingFen = getStartingFen(this._game);

    this._moveHistory = this._game.history({ verbose: true });
    this._fenHistory = getFensFromMoves(this._startingFen, this._moveHistory);
    this._moveIndex = this._moveHistory.length - 1;

    this._customMoveHistory = [];
    this._customFenHistory = [];
    this._customMoveIndex = -1;

    this._emit("update");
  }

  reset() {
    this._game.reset();

    this._resetHistory();
  }

  goToStart() {
    let executed = false;

    while (this._customMoveIndex >= 0 || this._moveIndex >= 0) {
      this._goBackward();

      executed = true;
    }

    if (executed) {
      this._emit("update");
    }
  }
  private _goBackward() {
    if (this._customMoveIndex >= 0) {
      --this._customMoveIndex;

      if (this._customMoveIndex < 0 && this._moveHistory.length > 0) {
        this._customMoveHistory = [];
        this._customFenHistory = [];
      }
    } else if (this._moveIndex >= 0) {
      --this._moveIndex;
    } else {
      return;
    }

    this._game.undo();
  }
  goBackward() {
    this._goBackward();

    this._emit("update");
  }
  private _goForward() {
    if (
      this._customMoveHistory.length > 0 &&
      this._customMoveIndex < this._customMoveHistory.length - 1
    ) {
      ++this._customMoveIndex;

      this._game.move(this._customMoveHistory[this._customMoveIndex]);
    } else if (this._moveIndex < this._moveHistory.length - 1) {
      ++this._moveIndex;

      this._game.move(this._moveHistory[this._moveIndex]);
    } else {
      return;
    }
  }
  goForward() {
    this._goForward();

    this._emit("update");
  }
  goToEnd() {
    let executed = false;

    while (
      this._customMoveIndex < this._customMoveHistory.length - 1 ||
      this._moveIndex < this._moveHistory.length - 1
    ) {
      this._goForward();

      executed = true;
    }

    if (executed) {
      this._emit("update");
    }
  }

  goToMove(moveIndex: number) {
    let executed = false;

    while (this._moveIndex + this._customMoveIndex + 1 > moveIndex) {
      this._goBackward();

      executed = true;
    }

    while (this._moveIndex + this._customMoveIndex + 1 < moveIndex) {
      this._goForward();

      executed = true;
    }

    if (executed) {
      this._emit("update");
    }
  }

  private _executeMove(move: Move | string): boolean {
    try {
      const moveObject = this._game.move(move);

      this._customMoveIndex++;

      this._customMoveHistory = [
        ...this._customMoveHistory.slice(0, this._customMoveIndex),
        moveObject,
      ];
      this._customFenHistory = [
        ...this._customFenHistory.slice(0, this._customMoveIndex),
        this._game.fen(),
      ];

      return true;
    } catch {
      return false;
    }
  }
  executeMoves(moves: (Move | string)[]): boolean {
    let numSuccessful = 0;

    for (const move of moves) {
      if (this._executeMove(move)) {
        numSuccessful++;
      } else {
        break;
      }
    }

    if (numSuccessful === moves.length) {
      this._emit("update");
      this._emit("move");
    } else {
      for (let i = 0; i < numSuccessful; ++i) {
        this._game.undo();
      }
    }

    return numSuccessful === moves.length;
  }

  loadFen(fen: string) {
    this._game.load(fen);

    this._resetHistory();
  }
  loadPgn(pgn: string) {
    this._game.loadPgn(pgn);

    this._resetHistory();
  }

  on(event: ChessGameEventType, listener: () => void) {
    let eventListeners = this._listeners.get(event);

    if (eventListeners === undefined) {
      eventListeners = new Set();

      this._listeners.set(event, eventListeners);
    }

    eventListeners.add(listener);
  }
  off(event: ChessGameEventType, listener: () => void) {
    const eventListeners = this._listeners.get(event);

    if (eventListeners === undefined) {
      return;
    }

    eventListeners.delete(listener);

    if (eventListeners.size === 0) {
      this._listeners.delete(event);
    }
  }
  private _emit(event: ChessGameEventType, ...args: any[]) {
    for (const listener of Array.from(
      this._listeners.get(event)?.values() ?? []
    )) {
      listener(...args);
    }
  }
}
