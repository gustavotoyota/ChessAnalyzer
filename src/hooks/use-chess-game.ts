import { useEffect, useState } from "react";

import { ChessGame } from "@/core/chess-game";
import { createProxyInstance } from "@/misc/proxy-instance";

export default function useChessGame() {
  const [game, setGame] = useState(() => new ChessGame());

  function _onUpdate() {
    setGame(createProxyInstance(game));
  }

  useEffect(() => {
    game.on("update", _onUpdate);

    return () => {
      game.off("update", _onUpdate);
    };
  }, []);

  return game;
}
