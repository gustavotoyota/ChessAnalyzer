import { Chessboard } from "@gustavotoyota/react-chessboard";
import {
  Arrow,
  BoardOrientation,
} from "@gustavotoyota/react-chessboard/dist/chessboard/types";
import { Square } from "chess.js";

import { ChessGame } from "@/core/chess-game";
import { checkPromotion } from "@/core/utils";

export default function ChessboardUI(props: {
  game: ChessGame;
  arrows?: Arrow[];
  boardOrientation?: BoardOrientation;
}) {
  return (
    <Chessboard
      position={props.game.fen}
      areArrowsAllowed={false}
      customArrows={props.arrows}
      customArrowColors={{
        default: "#ffaa00",
        ctrl: "#f8553f",
        shift: "#9fcf3f",
        alt: "#48c1f9",
      }}
      customHighlightColors={{
        default: "#f8553f",
        ctrl: "#ffaa00",
        shift: "#9fcf3f",
        alt: "#48c1f9",
      }}
      onPieceDrop={(
        sourceSquare: Square,
        targetSquare: Square,
        piece: string
      ) => {
        if (
          checkPromotion(
            sourceSquare,
            targetSquare,
            props.game.get(sourceSquare).color +
              props.game.get(sourceSquare).type.toUpperCase()
          )
        ) {
          return props.game.executeMoves([
            `${sourceSquare}${targetSquare}=${piece.at(-1)}`,
          ]);
        } else {
          return props.game.executeMoves([`${sourceSquare}${targetSquare}`]);
        }
      }}
      boardOrientation={props.boardOrientation}
    ></Chessboard>
  );
}
