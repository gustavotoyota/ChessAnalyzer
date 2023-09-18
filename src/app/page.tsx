"use client";

import Button from "@/components/button";
import ChessLines from "@/components/chess-lines";
import EvaluationBar from "@/components/evaluation-bar";
import FenLoader from "@/components/fen-loader";
import GameHistory from "@/components/game-history";
import PgnLoader from "@/components/pgn-loader";
import PlayVsComputerDialog from "@/components/play-vs-computer-dialog";
import { useEvent } from "@/hooks/use-event";
import useStateWithRef from "@/hooks/use-ref-with-state";
import useValueRef from "@/hooks/use-value-ref";
import {
  getChessMovesFromLine,
  getScoreText,
  getStartingFen,
} from "@/misc/chess";
import { ChessLine } from "@/misc/types";
import { Chessboard } from "@gustavotoyota/react-chessboard";
import { Arrow } from "@gustavotoyota/react-chessboard/dist/chessboard/types";
import { Chess, Move, Square } from "chess.js";
import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const game = useValueRef(() => new Chess());
  const [startingFen, setStartingFen] = useState(() => game.current.fen());

  const [inputFen, setInputFen] = useState(() => game.current.fen());
  const [inputPgn, setInputPgn] = useState(() =>
    game.current.pgn({ maxWidth: 30, newline: "\n" })
  );

  const [history, setHistory, historyRef] = useStateWithRef<Move[]>(() => []);
  const [uiFen, setUIFen] = useState(() => game.current.fen());
  const [moveIndex, setMoveIndex, moveIndexRef] = useStateWithRef(() => 0);

  const stockfish = useValueRef<Worker>();

  const stockfishMoveIndex = useValueRef(() => 0);
  const stockfishThreatsEnabled = useValueRef(() => false);
  const stockfishGame = useValueRef(() => new Chess());

  const [bestLines, setBestLines, bestLinesRef] = useStateWithRef<
    Map<number, ChessLine>
  >(() => new Map());

  const [analysisEnabled, setAnalysisEnabled] = useState(true);
  const [arrows, setArrows] = useState<Arrow[]>([]);

  const [customMoveIndex, setCustomMoveIndex, customMoveIndexRef] =
    useStateWithRef(() => -1);
  const [customMoves, setCustomMoves, customMovesRef] = useStateWithRef<Move[]>(
    () => []
  );

  const allMoves = useMemo(
    () =>
      (customMoves.length > 0 ? history.slice(0, moveIndex) : history).concat(
        customMoves
      ),
    [history, moveIndex, customMoves]
  );

  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">(
    "white"
  );

  const [playVsComputerDialogOpen, setPlayVsComputerDialogOpen] =
    useState(false);
  const [computerEnabled, setComputerEnabled, computerEnabledRef] =
    useStateWithRef(() => false);
  const computerElo = useValueRef(() => 1320);
  const computerColor = useValueRef<"white" | "black">(() => "white");

  const [threatsModeEnabled, setThreatsModeEnabled, threatsModeEnabledRef] =
    useStateWithRef(() => false);
  const [threatsGame, setThreatsGame, threatsGameRef] = useStateWithRef(
    () => new Chess()
  );

  function defaultMessageHandler(event: MessageEvent<any>) {
    if (event.data.startsWith("info depth")) {
      const info = event.data.split(" ");

      const lineDepth = info[2];
      const lineId = info[info.indexOf("multipv") + 1];

      if (
        (info[3] === "seldepth" && lineDepth === "1" && lineId === "1") ||
        info[4] === "mate"
      ) {
        stockfishMoveIndex.current = moveIndexRef.current;
        stockfishThreatsEnabled.current = threatsModeEnabledRef.current;
        stockfishGame.current = new Chess(game.current.fen());

        setBestLines(new Map());
        setArrows([]);
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

      if (stockfishGame.current.turn() === "b") {
        lineScore = -lineScore;
      }

      if (stockfishThreatsEnabled.current) {
        lineScore = -lineScore;
      }

      const mate = info[scoreIndex + 1] === "mate";

      const scoreText = getScoreText({ mate, score: lineScore });

      bestLinesRef.current.set(lineId - 1, {
        moves: getChessMovesFromLine(
          stockfishThreatsEnabled.current
            ? threatsGameRef.current
            : game.current,
          lineMoves
        ),
        mate: mate,
        score: lineScore,
        scoreText: scoreText,
      });

      setBestLines(new Map(bestLinesRef.current));

      const newArrows: Arrow[] = [];
      const moveSet = new Set<string>();

      for (const [index, line] of Array.from(bestLinesRef.current.entries())) {
        if (moveSet.has(line.moves[0].lan)) {
          continue;
        }

        newArrows.push({
          from: line.moves[0].from,
          to: line.moves[0].to,

          color: stockfishThreatsEnabled.current ? "#c00000" : "#003088",
          width: 16 - 2 * index,
          opacity: 0.4 - 0.05 * index,

          text: line.scoreText,
          textColor: stockfishThreatsEnabled.current ? "#0000b8" : "#b80000",
          fontSize: "15",
          fontWeight: "bold",
        });

        moveSet.add(line.moves[0].lan);
      }

      setArrows(newArrows);
    }

    if (event.data === "uciok") {
      stockfish.current.postMessage(
        `setoption name Threads value ${navigator.hardwareConcurrency}`
      );
      stockfish.current.postMessage("setoption name Hash value 128");
      stockfish.current.postMessage("setoption name MultiPV value 5");

      updateBoard();

      return;
    }
  }

  useEffect(() => {
    stockfish.current = new Worker("stockfish-nnue-16.js");

    stockfish.current.onmessage = defaultMessageHandler;

    stockfish.current.postMessage("uci");
  }, []);

  useEvent("keydown", (event) => {
    if (
      event.target instanceof HTMLElement &&
      ((event.target.nodeName === "INPUT" &&
        event.target.getAttribute("type") === "text") ||
        event.target.nodeName === "TEXTAREA" ||
        event.target.isContentEditable)
    ) {
      return;
    }

    if (event.ctrlKey && event.code === "ArrowLeft") {
      goToBeginning();
    } else if (event.ctrlKey && event.code === "ArrowRight") {
      goToEnd();
    } else if (event.code === "ArrowLeft") {
      goBackward();
    } else if (event.code === "ArrowRight") {
      goForward();
    } else if (event.code === "KeyF") {
      flipBoard();
    } else if (event.code === "KeyA") {
      setAnalysisEnabled((oldAnalysisEnabled) => !oldAnalysisEnabled);
    } else if (event.code === "KeyR") {
      resetBoard();
    } else if (event.code === "KeyX") {
      void toggleThreatsMode();
    }
  });

  function flipBoard() {
    setBoardOrientation((oldBoardOrientation) =>
      oldBoardOrientation === "white" ? "black" : "white"
    );
  }

  function updateBoard() {
    stockfish.current.onmessage = defaultMessageHandler;

    stockfish.current.postMessage("stop");

    if (threatsModeEnabledRef.current) {
      const flippedFenParts = game.current.fen().split(" ");

      flippedFenParts[1] = flippedFenParts[1] === "w" ? "b" : "w";

      const flippedFen = flippedFenParts.join(" ");

      setThreatsGame(new Chess(flippedFen));

      stockfish.current.postMessage(`position fen ${flippedFen}`);
    } else {
      stockfish.current.postMessage(`position fen ${game.current.fen()}`);
    }

    stockfish.current.postMessage("go depth 20");

    setUIFen(game.current.fen());

    setInputFen(game.current.fen());
    setInputPgn(game.current.pgn({ maxWidth: 30, newline: "\n" }));
  }

  function analyzeGame() {
    setStartingFen(getStartingFen(game.current));

    setHistory(game.current.history({ verbose: true }));

    setCustomMoveIndex(-1);
    setCustomMoves([]);

    setMoveIndex(historyRef.current.length);

    updateBoard();
  }

  function resetBoard() {
    game.current.reset();

    setStartingFen(game.current.fen());

    setHistory([]);

    setCustomMoveIndex(-1);
    setCustomMoves([]);

    setMoveIndex(0);

    updateBoard();
  }

  function goToBeginning() {
    let executed = false;

    while (customMoveIndexRef.current >= 0 || moveIndexRef.current > 0) {
      goBackward({ updateBoard: false });

      executed = true;
    }

    if (executed) {
      updateBoard();
    }
  }

  function goBackward(params?: { updateBoard?: boolean }) {
    setThreatsModeEnabled(false);

    if (customMoveIndexRef.current >= 0) {
      setCustomMoveIndex(customMoveIndexRef.current - 1);

      if (customMoveIndexRef.current < 0 && historyRef.current.length > 0) {
        setCustomMoves([]);
      }

      game.current.undo();

      if (params?.updateBoard !== false) {
        updateBoard();
      }

      return;
    }

    if (moveIndexRef.current <= 0) {
      return;
    }

    setMoveIndex(Math.max(moveIndexRef.current - 1, 0));

    game.current.undo();

    if (params?.updateBoard !== false) {
      updateBoard();
    }
  }

  function goForward(params?: { updateBoard?: boolean }) {
    setThreatsModeEnabled(false);

    if (customMovesRef.current.length > 0) {
      if (customMoveIndexRef.current < customMovesRef.current.length - 1) {
        setCustomMoveIndex(customMoveIndexRef.current + 1);

        game.current.move(customMovesRef.current[customMoveIndexRef.current]);

        if (params?.updateBoard !== false) {
          updateBoard();
        }
      }

      return;
    }

    if (moveIndexRef.current >= historyRef.current.length) {
      return;
    }

    game.current.move(historyRef.current[moveIndexRef.current]);
    setMoveIndex(moveIndexRef.current + 1);

    if (params?.updateBoard !== false) {
      updateBoard();
    }
  }

  function goToEnd() {
    let executed = false;

    while (
      customMoveIndexRef.current < customMovesRef.current.length - 1 ||
      moveIndexRef.current < historyRef.current.length
    ) {
      goForward({ updateBoard: false });

      executed = true;
    }

    if (executed) {
      updateBoard();
    }
  }

  function _executeMove(moveStr: string) {
    try {
      const moveObject = game.current.move(moveStr);

      setCustomMoveIndex(customMoveIndexRef.current + 1);
      setCustomMoves([
        ...customMovesRef.current.slice(0, customMoveIndexRef.current),
        moveObject,
      ]);

      return true;
    } catch {
      return false;
    }
  }

  function executeMoves(moves: string[]) {
    let numSuccessful = 0;

    setThreatsModeEnabled(false);

    for (const move of moves) {
      if (_executeMove(move)) {
        numSuccessful++;
      } else {
        break;
      }
    }

    if (numSuccessful !== moves.length) {
      for (let i = 0; i < numSuccessful; ++i) {
        game.current.undo();
      }
    }

    if (
      numSuccessful === moves.length &&
      computerEnabledRef.current &&
      game.current.turn() === computerColor.current[0]
    ) {
      void executeComputerMove();
    }

    if (numSuccessful === moves.length) {
      updateBoard();
    }

    return numSuccessful === moves.length;
  }

  function goToMove(moveIndex: number) {
    let executed = false;

    while (moveIndex < moveIndexRef.current + customMoveIndexRef.current) {
      goBackward({ updateBoard: false });

      executed = true;
    }

    while (moveIndex > moveIndexRef.current + customMoveIndexRef.current) {
      goForward({ updateBoard: false });

      executed = true;
    }

    if (executed) {
      updateBoard();
    }
  }

  async function waitStockfishMessage(
    filter: (message: string) => any
  ): Promise<any> {
    return new Promise((resolve) => {
      const listener = (event: MessageEvent<any>) => {
        const result = filter(event.data);

        if (!result) {
          return;
        }

        resolve(result);

        stockfish.current.removeEventListener("message", listener);
      };

      stockfish.current.addEventListener("message", listener);
    });
  }

  async function executeComputerMove() {
    stockfish.current.postMessage("stop");

    stockfish.current.postMessage("isready");
    await waitStockfishMessage((message) => message === "readyok");

    stockfish.current.postMessage(
      `setoption name UCI_LimitStrength value true`
    );
    stockfish.current.postMessage(
      `setoption name UCI_Elo value ${computerElo.current}`
    );

    stockfish.current.postMessage("isready");
    await waitStockfishMessage((message) => message === "readyok");

    stockfish.current.postMessage("stop");

    stockfish.current.postMessage(`position fen ${game.current.fen()}`);

    stockfish.current.postMessage("go movetime 2000");

    const move = await waitStockfishMessage((message) => {
      if (message.startsWith("bestmove")) {
        return message.split(" ")[1];
      }
    });

    stockfish.current.postMessage(
      `setoption name UCI_LimitStrength value false`
    );

    stockfish.current.postMessage("isready");
    await waitStockfishMessage((message) => message === "readyok");

    executeMoves([move]);
  }

  function checkPromotion(
    sourceSquare: Square,
    targetSquare: Square,
    piece: string
  ): boolean {
    return (
      ((piece === "wP" && sourceSquare[1] === "7" && targetSquare[1] === "8") ||
        (piece === "bP" &&
          sourceSquare[1] === "2" &&
          targetSquare[1] === "1")) &&
      Math.abs(sourceSquare.charCodeAt(0) - targetSquare.charCodeAt(0)) <= 1
    );
  }

  async function toggleThreatsMode() {
    if (!threatsModeEnabledRef.current && game.current.isCheck()) {
      return;
    }

    setThreatsModeEnabled((oldThreatsModeEnabled) => !oldThreatsModeEnabled);

    updateBoard();
  }

  return (
    <main className="h-full flex items-center justify-center flex-col">
      <div className="flex">
        <div className={`flex h-[500px] ${analysisEnabled ? "" : "invisible"}`}>
          <EvaluationBar
            score={bestLines.get(0) ?? { mate: false, score: 0 }}
          />

          <div className="w-6" />
        </div>

        <div className="flex items-center flex-col">
          <div className="flex">
            <div className="w-[500px]">
              <Chessboard
                position={uiFen}
                areArrowsAllowed={false}
                customArrows={analysisEnabled ? arrows : []}
                onPieceDrop={(
                  sourceSquare: Square,
                  targetSquare: Square,
                  piece: string
                ) => {
                  if (
                    checkPromotion(
                      sourceSquare,
                      targetSquare,
                      game.current.get(sourceSquare).color +
                        game.current.get(sourceSquare).type.toUpperCase()
                    )
                  ) {
                    return executeMoves([
                      `${sourceSquare}${targetSquare}=${piece.at(-1)}`,
                    ]);
                  } else {
                    return executeMoves([`${sourceSquare}${targetSquare}`]);
                  }
                }}
                boardOrientation={boardOrientation}
              ></Chessboard>
            </div>
          </div>

          <div className="h-8" />

          <div className="flex">
            <Button value="Reset (R)" onClick={() => resetBoard()} />

            <div className="w-4" />

            <Button value="|<" onClick={() => goToBeginning()} />

            <div className="w-4" />

            <Button value="<" onClick={() => goBackward()} />

            <div className="w-2" />

            <Button value=">" onClick={() => goForward()} />

            <div className="w-4" />

            <Button value=">|" onClick={() => goToEnd()} />

            <div className="w-4" />

            <Button value="Flip (F)" onClick={() => flipBoard()} />
          </div>

          <div className="h-4" />

          <div className="flex">
            {computerEnabled ? (
              <Button
                value="Play vs. computer"
                className="bg-red-600 hover:bg-red-800"
                onClick={() => setComputerEnabled(false)}
              />
            ) : (
              <Button
                value="Play vs. computer"
                onClick={() => setPlayVsComputerDialogOpen(true)}
              />
            )}

            <div className="w-4" />

            <Button
              value="Toggle analysis (A)"
              onClick={() =>
                setAnalysisEnabled((oldAnalysisEnabled) => !oldAnalysisEnabled)
              }
            />

            <div className="w-4" />

            {threatsModeEnabled ? (
              <Button
                value="Show threats (X)"
                className="bg-red-600 hover:bg-red-800"
                onClick={() => toggleThreatsMode()}
              />
            ) : (
              <Button
                value="Show threats (X)"
                onClick={() => toggleThreatsMode()}
              />
            )}
          </div>

          <div className="h-8" />

          <FenLoader
            fen={inputFen}
            onChange={(fen) => setInputFen(fen)}
            onLoad={(fen) => {
              game.current.load(fen);

              analyzeGame();
            }}
          />

          <div className="h-6" />

          <PgnLoader
            pgn={inputPgn}
            onChange={(pgn) => setInputPgn(pgn)}
            onLoad={(pgn) => {
              game.current.loadPgn(pgn);

              analyzeGame();
            }}
          />
        </div>

        <div className="w-8"></div>

        <div className="w-96 h-[700px] bg-neutral-700 p-4 text-xs text-neutral-200 flex flex-col">
          {analysisEnabled && (
            <>
              <ChessLines
                startingFen={threatsModeEnabled ? threatsGame.fen() : uiFen}
                lines={bestLines}
                onMovesSelected={(moves) =>
                  executeMoves(moves.map((move) => move.lan))
                }
              />

              <div className="h-4"></div>
            </>
          )}

          <GameHistory
            startingFen={startingFen}
            moveIndex={moveIndex + customMoveIndex}
            numCustomMoves={customMoves.length}
            moves={allMoves}
            onMoveSelected={(moveIndex) => goToMove(moveIndex)}
          />
        </div>
      </div>

      {playVsComputerDialogOpen && (
        <PlayVsComputerDialog
          onPlay={(config) => {
            computerElo.current = config.computerElo;
            computerColor.current =
              config.playerColor === "white" ? "black" : "white";
            setComputerEnabled(true);

            setAnalysisEnabled(!config.hideAnalysis);

            setBoardOrientation(config.playerColor);

            if (game.current.turn() === computerColor.current[0]) {
              void executeComputerMove();
            }
          }}
          onClose={() => setPlayVsComputerDialogOpen(false)}
        />
      )}
    </main>
  );
}
