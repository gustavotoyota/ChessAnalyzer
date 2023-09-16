"use client";

import { useEvent } from "@/hooks/use-event";
import { Chess, Move, Square } from "chess.js";
import { useEffect, useRef, useState } from "react";
import { Chessboard } from "@gustavotoyota/react-chessboard";

export default function Home() {
  const [pgn, setPgn] = useState("");

  const game = useRef(new Chess());
  const history = useRef<Move[]>([]);
  const [fen, setFen] = useState(game.current.fen());
  const moveIndex = useRef(0);

  const stockfish = useRef<Worker>();

  const arrowMap = new Map<string, { move: string; score: string }>();
  const [arrows, setArrows] = useState<any[]>([]);

  const [mate, setMate] = useState(false);
  const [score, setScore] = useState(0);

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

        const arrowId = info[info.indexOf("multipv") + 1];
        const move = info[info.indexOf("pv") + 1];

          const scoreIndex = info.indexOf("score");

          let score = parseInt(info[scoreIndex + 2]);

          if (game.current.turn() === "b") {
            score = -score;
          }

        const isMate = info[scoreIndex + 1] === "mate";

        if (arrowId === "1") {
          setMate(isMate);
          setScore(score);
        }

        arrowMap.set(arrowId, {
          move,
          score: isMate ? `M${score}` : (score / 100).toFixed(1),
        });

        const newArrows: Square[][] = [];
        const moveSet = new Set<string>();

        for (const arrow of Array.from(arrowMap.values())) {
          if (moveSet.has(arrow.move)) {
            continue;
          }

          newArrows.push([
            arrow.move.slice(0, 2) as any,
            arrow.move.slice(2, 4),
            "red",
            arrow.score,
          ]);

          moveSet.add(arrow.move);
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
    arrowMap.clear();
    setArrows([]);

    const moves = history.current
      .slice(0, moveIndex.current)
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
    if (moveIndex.current <= 0) {
      return;
    }

    moveIndex.current = 0;
    game.current.reset();

    updateBoard();
  }

  function goBackward() {
    if (moveIndex.current <= 0) {
      return;
    }

    moveIndex.current = Math.max(moveIndex.current - 1, 0);

    game.current.undo();

    updateBoard();
  }

  function goForward() {
    if (moveIndex.current >= history.current.length) {
      return;
    }

    game.current.move(history.current[moveIndex.current++]);

    updateBoard();
  }

  function goToEnd() {
    if (moveIndex.current >= history.current.length) {
      return;
    }

    while (moveIndex.current < history.current.length) {
      game.current.move(history.current[moveIndex.current++]);
    }

    updateBoard();
  }

  return (
    <main className="h-full flex items-center justify-center flex-col">
      <div className="flex">
        <div className="relative bg-neutral-600 w-6">
          <div
            className="absolute bottom-0 left-0 right-0 bg-neutral-100"
            style={{
              height: mate
                ? score > 0
                  ? "100%"
                  : "0%"
                : `${50 + 50 * (2 / (1 + Math.exp(-0.00368208 * score)) - 1)}%`,
            }}
          ></div>

          <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 text-xs text-center  ">
            {mate ? `M${Math.abs(score)}` : (score / 100).toFixed(1)}
          </div>
        </div>

        <div className="w-4" />

        <div className="w-[500px]">
          <Chessboard
            position={fen}
            areArrowsAllowed={false}
            arePiecesDraggable={false}
            customArrows={arrows}
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
          onClick={goBackward}
        />

        <div className="w-2" />

        <input
          type="button"
          value=">"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={goForward}
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
    </main>
  );
}
