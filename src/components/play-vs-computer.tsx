import { useState } from "react";

import { ChessGame } from "@/core/chess-game";
import { StockfishWrapper } from "@/core/stockfish-wrapper";
import { useOnEvent } from "@/hooks/use-on-event";
import useStateWithRef from "@/hooks/use-ref-with-state";

import Button from "./button";
import Dialog from "./dialog";

export default function PlayVsComputer(props: {
  gameMutable: ChessGame;
  stockfishWrapper: StockfishWrapper;
  setAnalysisEnabled: (
    value: boolean | ((oldValue: boolean) => boolean)
  ) => void;
}) {
  const [playVsComputerDialogOpen, setPlayVsComputerDialogOpen] =
    useState(false);

  const [
    playVsComputerEnabled,
    setPlayVsComputerEnabled,
    playVsComputerEnabledRef,
  ] = useStateWithRef(() => false);

  const [elo, setElo, eloRef] = useStateWithRef(() => 1320);

  const [color, setColor, colorRef] = useStateWithRef<"white" | "black">(
    () => "white"
  );

  const [hideAnalysis, setHideAnalysis] = useState(true);

  useOnEvent(
    () => props.gameMutable,
    "move",
    async () => {
      if (
        !playVsComputerEnabledRef.current ||
        props.gameMutable.turn === colorRef.current[0]
      ) {
        return;
      }

      props.stockfishWrapper.stop();

      props.stockfishWrapper.limitStrength(true, eloRef.current);
      props.stockfishWrapper.setNumLines(1);

      await props.stockfishWrapper.waitReady();

      props.stockfishWrapper.goTime(props.gameMutable.fen, 2000);

      const move = await props.stockfishWrapper.waitBestMove();

      props.stockfishWrapper.limitStrength(false);
      props.stockfishWrapper.setNumLines(5);

      await props.stockfishWrapper.waitReady();

      props.gameMutable.executeMoves([move]);
    }
  );

  return (
    <>
      {playVsComputerEnabled ? (
        <Button
          value="Play vs. computer"
          className="bg-red-600 hover:bg-red-800"
          onClick={() => setPlayVsComputerEnabled(false)}
        />
      ) : (
        <Button
          value="Play vs. computer"
          onClick={() => setPlayVsComputerDialogOpen(true)}
        />
      )}

      {playVsComputerDialogOpen && (
        <Dialog
          onClose={() => setPlayVsComputerDialogOpen(false)}
          title="Play vs. computer"
          body={
            <>
              <div className="text-center">
                <b>Computer elo:</b> {elo}
              </div>

              <div className="h-1"></div>

              <input
                type="range"
                className="w-full"
                min={1320}
                max={3190}
                value={elo}
                onChange={(event) => setElo(event.target.value as any)}
              />

              <div className="h-3" />

              <div className="text-center">
                <b>You will play as:</b>
              </div>

              <div className="h-1" />

              <div className="flex justify-center">
                <label htmlFor="white">
                  <input
                    id="white"
                    type="radio"
                    value="white"
                    name="color"
                    checked={color === "white"}
                    onChange={(event) => setColor(event.target.value as any)}
                  />{" "}
                  White
                </label>

                <div className="w-4" />

                <label htmlFor="black">
                  <input
                    id="black"
                    type="radio"
                    value="black"
                    name="color"
                    checked={color === "black"}
                    onChange={(event) => setColor(event.target.value as any)}
                  />{" "}
                  Black
                </label>
              </div>

              <div className="h-5" />

              <div className="text-center">
                <label htmlFor="hide-analysis">
                  <input
                    type="checkbox"
                    checked={hideAnalysis}
                    onChange={(event) => setHideAnalysis(event.target.checked)}
                  />{" "}
                  Hide analysis
                </label>
              </div>
            </>
          }
          footer={
            <>
              <Button
                value="Cancel"
                className="bg-red-600 hover:bg-red-800"
                onClick={() => setPlayVsComputerDialogOpen(false)}
              />

              <div className="w-3" />

              <Button
                value="Play"
                onClick={() => {
                  if (hideAnalysis) {
                    props.setAnalysisEnabled(false);
                  }

                  setPlayVsComputerEnabled(true);

                  setPlayVsComputerDialogOpen(false);
                }}
              />
            </>
          }
        />
      )}
    </>
  );
}
