import { BoardOrientation } from "@gustavotoyota/react-chessboard/dist/chessboard/types";
import { useState } from "react";

export function useBoardOrientation() {
  const [boardOrientation, setBoardOrientation] =
    useState<BoardOrientation>("white");

  function flipBoard() {
    setBoardOrientation((oldBoardOrientation) =>
      oldBoardOrientation === "white" ? "black" : "white"
    );
  }

  return {
    boardOrientation,
    setBoardOrientation,
    flipBoard,
  };
}
