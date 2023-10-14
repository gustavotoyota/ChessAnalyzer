import { ChessGame } from "./chess-game";
import { ChessLine } from "./types";
import { getChessMovesFromLine, getScoreText } from "./utils";

export type StockfishEventType = "best-lines" | "best-move";

export class StockfishWrapper {
  private _stockfish!: Worker;

  private _realGame: ChessGame;
  private _stockfishGame: ChessGame;

  private _listeners = new Map<
    StockfishEventType,
    Set<(...args: any[]) => any>
  >();

  private _bestLines = new Map<number, ChessLine>();

  constructor(input: { realGame: ChessGame }) {
    this._realGame = input.realGame;
    this._stockfishGame = new ChessGame();
  }

  init(input: { stockfish: Worker }) {
    this._stockfish = input.stockfish;

    this._stockfish.addEventListener("message", this._onMessage);

    this._stockfish.postMessage("uci");
    this._stockfish.postMessage("ucinewgame");
    this._stockfish.postMessage("isready");

    this._stockfish.postMessage(
      `setoption name Threads value ${navigator.hardwareConcurrency}`
    );
    this._stockfish.postMessage("setoption name Hash value 128");
    this._stockfish.postMessage("setoption name MultiPV value 5");

    this.goDepth(this._realGame.fen, 15);
  }

  get bestLines() {
    return this._bestLines;
  }

  destroy() {
    this._stockfish.removeEventListener("message", this._onMessage);
  }

  private _onMessage = (event: MessageEvent) => {
    if (event.data.startsWith("info depth")) {
      const info = event.data.split(" ");

      const lineDepth = info[2];
      const lineId = info[info.indexOf("multipv") + 1];

      if (
        (info[3] === "seldepth" && lineDepth === "1" && lineId === "1") ||
        info[4] === "mate"
      ) {
        this._stockfishGame = new ChessGame(this._realGame.fen);

        this._bestLines = new Map();
      }

      if (info[3] !== "seldepth") {
        return;
      }

      const lineMoves: string[] = [];

      for (
        let i = info.indexOf("pv") + 1;
        i < info.length && lineMoves.length < 15;
        i++
      ) {
        lineMoves.push(info[i]);
      }

      const scoreIndex = info.indexOf("score");

      let lineScore = parseInt(info[scoreIndex + 2]);

      if (this._stockfishGame.turn === "b") {
        lineScore = -lineScore;
      }

      const mate = info[scoreIndex + 1] === "mate";

      const scoreText = getScoreText({ mate, score: lineScore });

      this._bestLines.set(lineId - 1, {
        moves: getChessMovesFromLine(this._stockfishGame.game, lineMoves),
        mate: mate,
        score: lineScore,
        scoreText: scoreText,
      });

      this._emit("best-lines", this._bestLines);
    }
  };

  goDepth(fen: string, depth: number) {
    this._stockfish.postMessage(`position fen ${fen}`);
    this._stockfish.postMessage(`go depth ${depth}`);
  }
  goTime(fen: string, time: number) {
    this._stockfish.postMessage(`position fen ${fen}`);
    this._stockfish.postMessage(`go movetime ${time}`);
  }

  on(event: StockfishEventType, listener: (...args: any[]) => void) {
    let eventListeners = this._listeners.get(event);

    if (eventListeners === undefined) {
      eventListeners = new Set();

      this._listeners.set(event, eventListeners);
    }

    eventListeners.add(listener);
  }
  off(event: StockfishEventType, listener: (...args: any[]) => void) {
    const eventListeners = this._listeners.get(event);

    if (eventListeners === undefined) {
      return;
    }

    eventListeners.delete(listener);

    if (eventListeners.size === 0) {
      this._listeners.delete(event);
    }
  }
  private _emit(event: StockfishEventType, ...args: any[]) {
    for (const listener of Array.from(
      this._listeners.get(event)?.values() ?? []
    )) {
      listener(...args);
    }
  }
}
