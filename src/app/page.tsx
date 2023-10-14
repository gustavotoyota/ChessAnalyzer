"use client";

import { Inter } from "next/font/google";
import { useState } from "react";

import ChessLines from "@/components/best-lines-ui";
import Button from "@/components/button";
import ChessboardUI from "@/components/chessboard-ui";
import EvaluationBar from "@/components/evaluation-bar";
import FenLoadingUI from "@/components/fen-loading-ui";
import GameHistoryUI from "@/components/game-history-ui";
import PgnLoadingUI from "@/components/pgn-loading-ui";
import PlayVsComputer from "@/components/play-vs-computer";
import { getArrowsFromBestLines } from "@/core/arrows";
import { useBoardOrientation } from "@/hooks/use-board-orientation";
import useChessGame from "@/hooks/use-chess-game";
import useInnerWidth from "@/hooks/use-client-width";
import { useOnEvent } from "@/hooks/use-on-event";
import useStockfishWrapper from "@/hooks/use-stockfish-wrapper";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const innerWidth = useInnerWidth();

  const [analysisEnabled, setAnalysisEnabled] = useState(true);

  const chessGame = useChessGame();

  const { stockfishWrapper, bestLines } = useStockfishWrapper();

  useOnEvent(
    () => chessGame,
    "update",
    () => {
      stockfishWrapper.current.goDepth(chessGame.fen, 20);
    }
  );

  const { boardOrientation, flipBoard } = useBoardOrientation();

  return (
    <html
      lang="en"
      style={{
        fontSize: innerWidth < 650 ? `${innerWidth / 650}rem` : undefined,
      }}
    >
      <body className={inter.className}>
        <main className="flex items-center flex-col">
          <div className="h-4"></div>

          <div className="text-white/60 text-xs">
            Developed by{" "}
            <a
              href="https://gustavotoyota.dev/"
              className="text-sky-400 hover:text-sky-300"
              target="_blank"
            >
              Gustavo Toyota
            </a>
          </div>
          <div className="text-white/60 text-xs">
            <a
              href="https://github.com/gustavotoyota/ChessAnalyzer"
              className="text-sky-400 hover:text-sky-300"
              target="_blank"
            >
              https://github.com/gustavotoyota/ChessAnalyzer
            </a>
          </div>

          <div className="h-4"></div>

          <div className="flex">
            <div
              className={`flex h-[31.25rem] ${
                analysisEnabled ? "" : "invisible"
              }`}
            >
              <EvaluationBar
                score={
                  bestLines.get(0) ?? {
                    mate: false,
                    score: 0,
                  }
                }
                orientation={boardOrientation}
              />

              <div className="w-6" />
            </div>

            <div className="flex items-center flex-col">
              <div className="flex">
                <div className="w-[31.25rem]">
                  <ChessboardUI
                    game={chessGame}
                    boardOrientation={boardOrientation}
                    arrows={
                      analysisEnabled
                        ? getArrowsFromBestLines({ bestLines })
                        : []
                    }
                  />
                </div>
              </div>

              <div className="h-8" />

              <div className="flex">
                <Button
                  value="Reset board (R)"
                  onClick={() => chessGame.reset()}
                />

                <div className="w-4" />

                <Button value="|<" onClick={() => chessGame.goToStart()} />

                <div className="w-4" />

                <Button value="<" onClick={() => chessGame.goBackward()} />

                <div className="w-2" />

                <Button value=">" onClick={() => chessGame.goForward()} />

                <div className="w-4" />

                <Button value=">|" onClick={() => chessGame.goToEnd()} />

                <div className="w-4" />

                <Button value="Flip board (F)" onClick={() => flipBoard()} />
              </div>

              <div className="h-4" />

              <div className="flex">
                <PlayVsComputer
                  game={chessGame}
                  stockfishWrapper={stockfishWrapper.current}
                />

                <div className="w-4" />

                {analysisEnabled ? (
                  <Button
                    value="Hide analysis (A)"
                    onClick={() =>
                      setAnalysisEnabled(
                        (oldAnalysisEnabled) => !oldAnalysisEnabled
                      )
                    }
                  />
                ) : (
                  <Button
                    value="Show analysis (A)"
                    onClick={() =>
                      setAnalysisEnabled(
                        (oldAnalysisEnabled) => !oldAnalysisEnabled
                      )
                    }
                  />
                )}

                <div className="w-4" />

                {/* {threatsModeEnabled ? (
                  <Button
                    value="Hide threats (X)"
                    className="bg-red-600 hover:bg-red-800"
                    onClick={() => toggleThreatsMode()}
                  />
                ) : (
                  <Button
                    value="Show threats (X)"
                    onClick={() => toggleThreatsMode()}
                  />
                )} */}
              </div>

              <div className="h-8" />

              <FenLoadingUI
                fen={chessGame.fen}
                onLoad={(fen) => chessGame.loadFen(fen)}
              />

              <div className="h-6" />

              <PgnLoadingUI
                pgn={chessGame.finalPgn}
                onLoad={(pgn) => chessGame.loadPgn(pgn)}
              />
            </div>

            <div className="w-8"></div>

            {innerWidth >= 1100 && (
              <div className="w-96 h-[49.375rem] bg-neutral-700 p-4 text-xs text-neutral-200 flex flex-col">
                {analysisEnabled && (
                  <>
                    <ChessLines
                      game={chessGame}
                      lines={bestLines}
                      boardOrientation={boardOrientation}
                    />

                    <div className="h-4"></div>
                  </>
                )}

                <GameHistoryUI
                  game={chessGame}
                  boardOrientation={boardOrientation}
                />
              </div>
            )}
          </div>

          <div className="h-8"></div>

          {innerWidth < 1100 && (
            <div className="w-96 h-[49.375rem] bg-neutral-700 p-4 text-xs text-neutral-200 flex flex-col">
              {analysisEnabled && (
                <>
                  <ChessLines
                    game={chessGame}
                    lines={bestLines}
                    boardOrientation={boardOrientation}
                  />

                  <div className="h-4"></div>
                </>
              )}

              <GameHistoryUI
                game={chessGame}
                boardOrientation={boardOrientation}
              />
            </div>
          )}

          <div className="h-12"></div>
        </main>
      </body>
    </html>
  );
}
