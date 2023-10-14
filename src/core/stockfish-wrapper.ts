import { Chess } from "chess.js";

import { ChessLine } from "./types";
import { getChessMovesFromLine, getScoreText } from "./utils";

export type StockfishEventType = "best-lines" | "best-move";

export class StockfishWrapper {
  private _stockfish!: Worker;

  private _listeners = new Map<
    StockfishEventType,
    Set<(...args: any[]) => any>
  >();

  private _bestLines = new Map<number, ChessLine>();

  private _nextGame = new Chess();
  private _currentGame = new Chess();

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

    this.goDepth(this._currentGame.fen(), 20);
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
        this._currentGame = this._nextGame;

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

      if (this._currentGame.turn() === "b") {
        lineScore = -lineScore;
      }

      const mate = info[scoreIndex + 1] === "mate";

      const scoreText = getScoreText({ mate, score: lineScore });

      this._bestLines.set(lineId - 1, {
        moves: getChessMovesFromLine(this._currentGame, lineMoves),
        mate: mate,
        score: lineScore,
        scoreText: scoreText,
      });

      this._emit("best-lines", this._bestLines);
    }
  };

  limitStrength(limit: boolean, elo?: number) {
    this._stockfish.postMessage(
      `setoption name UCI_LimitStrength value ${limit ? "true" : "false"}}`
    );

    if (elo !== undefined) {
      this._stockfish.postMessage(`setoption name UCI_Elo value ${elo}`);
    }
  }
  setNumLines(numLines: number) {
    this._stockfish.postMessage(`setoption name MultiPV value ${numLines}`);
  }

  goDepth(fen: string, depth: number) {
    this._nextGame = new Chess(fen);

    this._stockfish.postMessage("stop");
    this._stockfish.postMessage(`position fen ${fen}`);
    this._stockfish.postMessage(`go depth ${depth}`);
  }
  goTime(fen: string, time: number) {
    this._nextGame = new Chess(fen);

    this._stockfish.postMessage("stop");
    this._stockfish.postMessage(`position fen ${fen}`);
    this._stockfish.postMessage(`go movetime ${time}`);
  }

  stop() {
    this._stockfish.postMessage("stop");
  }

  async waitMessage(filter: (message: string) => any): Promise<any> {
    return new Promise((resolve) => {
      const listener = (event: MessageEvent<any>) => {
        const result = filter(event.data);

        if (!result) {
          return;
        }

        resolve(result);

        this._stockfish.removeEventListener("message", listener);
      };

      this._stockfish.addEventListener("message", listener);
    });
  }
  async waitReady() {
    this._stockfish.postMessage("isready");

    await this.waitMessage((message) => message === "readyok");
  }
  async waitBestMove(): Promise<string> {
    return await this.waitMessage((message) => {
      if (message.startsWith("bestmove")) {
        return message.split(" ")[1];
      }
    });
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
