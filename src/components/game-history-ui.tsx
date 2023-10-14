import { Chessboard } from "@gustavotoyota/react-chessboard";
import { BoardOrientation } from "@gustavotoyota/react-chessboard/dist/chessboard/types";
import { Move } from "chess.js";
import { useState } from "react";

import { ChessGame } from "@/core/chess-game";

function _getMoveColor(params: {
  activeMoveIndex: number;
  renderMoveIndex: number;
  numTotalMoves: number;
  numCustomMoves: number;
}) {
  if (params.renderMoveIndex >= params.numTotalMoves) {
    return "";
  }

  const isActive = params.activeMoveIndex === params.renderMoveIndex;
  const isCustomMove =
    params.renderMoveIndex >= params.numTotalMoves - params.numCustomMoves;

  if (isActive) {
    if (isCustomMove) {
      return "bg-sky-500/60";
    } else {
      return "bg-white/40";
    }
  } else {
    if (isCustomMove) {
      return "bg-sky-500/20";
    } else {
      return "";
    }
  }
}

export default function GameHistoryUI(props: {
  game: ChessGame;
  boardOrientation: BoardOrientation;
}) {
  const [miniBoardX, setMiniBoardX] = useState(0);
  const [miniBoardY, setMiniBoardY] = useState(0);
  const [miniBoardVisible, setMiniBoardVisible] = useState(false);
  const [miniBoardFen, setMiniBoardFen] = useState(props.game.startingFen);

  return (
    <div className="flex-1 h-0 overflow-auto">
      {props.game.moveHistory
        .concat(props.game.customMoveHistory)
        .reduce(
          (acc, value, index, array) => {
            if (index % 2 === 0) {
              acc.push([value, array[index + 1]]);
            }

            return acc;
          },
          [] as [Move, Move][]
        )
        .map(([whiteMove, blackMove], i) => (
          <div key={i} className="flex items-center">
            <div className="w-6">{i + 1}.</div>

            <div className="w-2"></div>

            <div
              className={`w-14 font-bold rounded-sm cursor-pointer p-1 ${_getMoveColor(
                {
                  activeMoveIndex: props.game.finalMoveIndex,
                  renderMoveIndex: i * 2,
                  numTotalMoves: props.game.finalMoveHistory.length,
                  numCustomMoves: props.game.customMoveHistory.length,
                }
              )}`}
              onClick={() => {
                props.game.goToMove(i * 2);

                setMiniBoardVisible(false);
              }}
              onPointerMove={(event) => {
                setMiniBoardX(event.clientX);
                setMiniBoardY(event.clientY);
              }}
              onPointerEnter={() => {
                setMiniBoardFen(props.game.finalFenHistory[i * 2]);

                setMiniBoardVisible(true);
              }}
              onPointerLeave={() => setMiniBoardVisible(false)}
            >
              {whiteMove.san}
            </div>

            <div
              className={`w-14 font-bold rounded-sm cursor-pointer p-1 ${_getMoveColor(
                {
                  activeMoveIndex: props.game.finalMoveIndex,
                  renderMoveIndex: i * 2 + 1,
                  numTotalMoves: props.game.finalMoveHistory.length,
                  numCustomMoves: props.game.customMoveHistory.length,
                }
              )}`}
              onClick={() => {
                props.game.goToMove(i * 2 + 1);

                setMiniBoardVisible(false);
              }}
              onPointerMove={(event) => {
                setMiniBoardX(event.clientX);
                setMiniBoardY(event.clientY);
              }}
              onPointerEnter={() => {
                setMiniBoardFen(props.game.finalFenHistory[i * 2 + 1]);

                setMiniBoardVisible(true);
              }}
              onPointerLeave={() => setMiniBoardVisible(false)}
            >
              {blackMove?.san ?? ""}
            </div>
          </div>
        ))}

      {miniBoardVisible && (
        <div
          className="fixed p-1 bg-neutral-400"
          style={{
            left: `calc(${miniBoardX}px - 4rem)`,
            top: `calc(${miniBoardY}px + 1.5rem)`,
          }}
        >
          <div className="w-32 h-32">
            <Chessboard
              position={miniBoardFen}
              boardOrientation={props.boardOrientation}
            />
          </div>
        </div>
      )}
    </div>
  );
}
