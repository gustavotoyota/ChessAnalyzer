import { useEffect } from "react";

import { ChessGame } from "@/core/chess-game";
import { StockfishWrapper } from "@/core/stockfish-wrapper";
import { getFlippedFen } from "@/core/utils";

import Button from "./button";

export default function ThreatsMode(props: {
  gameMutable: ChessGame;
  stockfishWrapper: StockfishWrapper;
  threatsModeEnabled: boolean;
  setThreatsModeEnabled: (
    enabled: boolean | ((oldValue: boolean) => boolean)
  ) => void;
}) {
  function toggleThreatsMode() {
    props.setThreatsModeEnabled((oldThreatsModeEnabled) => {
      const newThreatsModeEnabled = !oldThreatsModeEnabled;

      if (newThreatsModeEnabled) {
        props.stockfishWrapper.goDepth(
          getFlippedFen(props.gameMutable.fen),
          20
        );
      } else {
        props.stockfishWrapper.goDepth(props.gameMutable.fen, 20);
      }

      return newThreatsModeEnabled;
    });
  }

  useEffect(() => {
    props.gameMutable.on("update", () => {
      props.setThreatsModeEnabled(false);
    });
  }, []);

  return (
    <>
      {props.threatsModeEnabled ? (
        <Button
          value="Hide threats (X)"
          className="bg-red-600 hover:bg-red-800"
          onClick={() => toggleThreatsMode()}
        />
      ) : (
        <Button value="Show threats (X)" onClick={() => toggleThreatsMode()} />
      )}
    </>
  );
}
