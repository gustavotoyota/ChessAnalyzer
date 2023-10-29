import { useEffect, useState } from "react";

import { ChessGame } from "@/core/chess-game";

import useValueRef from "./use-value-ref";

export default function useChessGame() {
  const gameMutable = useValueRef(() => new ChessGame());

  const [gameState, setGameState] = useState(() => new ChessGame());

  useEffect(() => {
    function _onUpdate() {
      setGameState(new ChessGame(gameMutable.current));
    }

    gameMutable.current.on("update", _onUpdate);

    return () => {
      gameMutable.current.off("update", _onUpdate);
    };
  }, []);

  return { gameMutable, gameState };
}
