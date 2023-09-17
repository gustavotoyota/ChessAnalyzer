"use client";

import { useEvent } from "@/hooks/use-event";
import { Chess, Move, Square } from "chess.js";
import { useEffect, useRef, useState } from "react";
import { Chessboard } from "@gustavotoyota/react-chessboard";
import { Arrow } from "@gustavotoyota/react-chessboard/dist/chessboard/types";

export default function Home() {
  const [pgn, setPgn] = useState("");

  const game = useRef(new Chess());
  const history = useRef<Move[]>([]);
  const [fen, setFen] = useState(game.current.fen());
  const moveIndex = useRef(0);

  const stockfish = useRef<Worker>();

  const [bestLines, setBestLines] = useState<
    { moves: Move[]; scoreText: string; scoreValue: number }[]
  >([]);
  const [arrows, setArrows] = useState<Arrow[]>([]);

  const numCustomMoves = useRef(0);
  const [customMoves, setCustomMoves] = useState<Move[]>([]);

  function smoothScore(score: number) {
    return 2 / (1 + Math.exp(-0.00368208 * score)) - 1;
  }

  function getMoveObjects(lans: string[]): Move[] {
    const moves: Move[] = [];

    try {
      for (const lan of lans) {
        moves.push(game.current.move(lan));
      }
    } catch {}

    for (let i = 0; i < moves.length; ++i) {
      game.current.undo();
    }

    if (moves.length === lans.length) {
      return moves;
    } else {
      return lans.map(
        (lan) =>
          ({
            from: lan.slice(0, 2) as Square,
            to: lan.slice(2, 4) as Square,
            lan,
            san: "",
          } as Move)
      );
    }
  }

  useEffect(() => {
    stockfish.current = new Worker("stockfish-nnue-16.js");

    stockfish.current.onmessage = (event) => {
      console.log(event.data ? event.data : event);

      if (event.data === "uciok") {
        updateBoard();
      }

      if (event.data.startsWith("info depth")) {
        const info = event.data.split(" ");

        if (info[3] !== "seldepth") {
          return;
        }

        const lineId = info[info.indexOf("multipv") + 1];

        const moves: string[] = [];

        for (
          let i = info.indexOf("pv") + 1;
          i < info.length && moves.length < 15;
          i++
        ) {
          moves.push(info[i]);
        }

        const scoreIndex = info.indexOf("score");

        let score = parseInt(info[scoreIndex + 2]);

        if (game.current.turn() === "b") {
          score = -score;
        }

        const isMate = info[scoreIndex + 1] === "mate";

        bestLines[lineId - 1] = {
          moves: getMoveObjects(moves),
          scoreText: isMate
            ? `M${score}`
            : `${score >= 0 ? "+" : ""}${(score / 100).toFixed(1)}`,
          scoreValue: score,
        };

        setBestLines(bestLines);

        const newArrows: Arrow[] = [];
        const moveSet = new Set<string>();

        for (const line of Array.from(bestLines.values())) {
          if (moveSet.has(line.moves[0].lan)) {
            continue;
          }

          newArrows.push({
            from: line.moves[0].from,
            to: line.moves[0].to,

            color: "red",

            text: line.scoreText,
            textColor: "#185bc9",
            fontSize: "15",
            fontWeight: "bold",
          });

          moveSet.add(line.moves[0].lan);
        }

        setArrows(newArrows);
      }
    };

    stockfish.current.postMessage("uci");
    stockfish.current.postMessage("setoption name Threads value 12");
    stockfish.current.postMessage("setoption name Hash value 128");
    stockfish.current.postMessage("setoption name MultiPV value 5");
  }, []);

  useEvent("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      goBackward();
    } else if (e.key === "ArrowRight") {
      goForward();
    }
  });

  function updateBoard() {
    // Clear arrows
    setBestLines([]);
    setArrows([]);

    const moves = history.current
      .slice(0, moveIndex.current)
      .concat(customMoves.slice(0, numCustomMoves.current))
      .map((move) => move.lan)
      .join(" ");

    stockfish.current?.postMessage("stop");
    stockfish.current?.postMessage(
      "position startpos" + (moves !== "" ? ` moves ${moves}` : "")
    );
    stockfish.current?.postMessage("go depth 20");

    setFen(game.current.fen());
  }

  function analyze() {
    game.current.loadPgn(pgn);
    history.current = game.current.history({ verbose: true });

    stockfish.current?.postMessage("ucinewgame");
    stockfish.current?.postMessage("isready");

    moveIndex.current = history.current.length;
    updateBoard();
  }

  function goToBeginning() {
    let executed = false;

    while (numCustomMoves.current > 0 || moveIndex.current > 0) {
      goBackward({ updateBoard: false });

      executed = true;
    }

    if (executed) {
      updateBoard();
    }
  }

  function goBackward(params?: { updateBoard?: boolean }) {
    if (numCustomMoves.current > 0) {
      numCustomMoves.current--;

      if (numCustomMoves.current <= 0 && history.current.length > 0) {
        setCustomMoves([]);
      }

      game.current.undo();
      updateBoard();
      return;
    }

    if (moveIndex.current <= 0) {
      return;
    }

    moveIndex.current = Math.max(moveIndex.current - 1, 0);

    game.current.undo();

    if (params?.updateBoard !== false) {
      updateBoard();
    }
  }

  function goForward(params?: { updateBoard?: boolean }) {
    if (customMoves.length > 0) {
      if (numCustomMoves.current < customMoves.length) {
        numCustomMoves.current++;
        game.current.move(customMoves[numCustomMoves.current - 1]);
        updateBoard();
      }

      return;
    }

    if (moveIndex.current >= history.current.length) {
      return;
    }

    game.current.move(history.current[moveIndex.current++]);

    if (params?.updateBoard !== false) {
      updateBoard();
    }
  }

  function goToEnd() {
    let executed = false;

    while (
      numCustomMoves.current < customMoves.length ||
      moveIndex.current < history.current.length
    ) {
      goForward({ updateBoard: false });

      executed = true;
    }

    if (executed) {
      updateBoard();
    }
  }

  function onPieceDrop(
    sourceSquare: Square,
    targetSquare: Square,
    piece: string
  ) {
    try {
      const move = game.current.move({
        from: sourceSquare,
        to: targetSquare,
      });

      if (move == null) {
        return false;
      }

      customMoves.splice(numCustomMoves.current++, customMoves.length, move);
      updateBoard();

      return true;
    } catch {
      return false;
    }
  }

  return (
    <main className="h-full flex items-center justify-center flex-col">
      <div className="flex">
        <div className="flex items-center flex-col">
          <div className="flex">
            <div className="relative bg-neutral-600 w-7">
              <div
                className="absolute bottom-0 left-0 right-0 bg-neutral-100"
                style={{
                  height: bestLines[0]?.scoreText.startsWith("M")
                    ? bestLines[0]!.scoreValue > 0
                      ? "100%"
                      : "0%"
                    : `${
                        50 + 50 * smoothScore(bestLines[0]?.scoreValue ?? 0)
                      }%`,
                }}
              ></div>

              <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 text-xs text-center  ">
                {bestLines[0]?.scoreText ?? "0.0"}
              </div>
            </div>

            <div className="w-6" />

            <div className="w-[500px]">
              <Chessboard
                position={fen}
                areArrowsAllowed={false}
                customArrows={arrows}
                onPieceDrop={onPieceDrop}
              ></Chessboard>
            </div>
          </div>

          <div className="h-8" />

          <div className="flex">
            <input
              type="button"
              value="|<"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={goToBeginning}
            />

            <div className="w-4" />

            <input
              type="button"
              value="<"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => goBackward()}
            />

            <div className="w-2" />

            <input
              type="button"
              value=">"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => goForward()}
            />

            <div className="w-4" />

            <input
              type="button"
              value=">|"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={goToEnd}
            />
          </div>

          <div className="h-8" />

          <div className="flex">
            <textarea
              className="w-80 h-20 border border-black resize-none"
              placeholder="Paste PGN here"
              value={pgn}
              onChange={(e) => setPgn(e.target.value)}
            />

            <div className="w-4" />

            <input
              type="button"
              value="Analyze"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={analyze}
            />
          </div>
        </div>

        <div className="w-8"></div>

        <div className="w-96 bg-neutral-700 p-4 text-xs text-neutral-200">
          {Array.from(bestLines.values()).map((line, i) => (
            <div
              key={i}
              className="border-b border-neutral-400 py-1 overflow-hidden overflow-ellipsis whitespace-nowrap"
            >
              <span className="font-bold">{line.scoreText}</span>

              <div className="inline-block w-2"></div>

              {line.moves.map((move, i) => (
                <span key={i}>
                  <span>{move.san}</span>

                  <div className="inline-block w-1"></div>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
