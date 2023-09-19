import { Chessboard } from "@gustavotoyota/react-chessboard";
import { Chess, Move } from "chess.js";
import { useState } from "react";

function getMoveColor(params: {
  activeMoveIndex: number;
  renderMoveIndex: number;
  numMoves: number;
  numCustomMoves: number;
}) {
  if (params.renderMoveIndex >= params.numMoves) {
    return "";
  }

  const isActive = params.activeMoveIndex === params.renderMoveIndex;
  const isCustomMove =
    params.renderMoveIndex >= params.numMoves - params.numCustomMoves;

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

export default function GameHistory(props: {
  startingFen: string;
  moveIndex: number;
  numCustomMoves: number;
  moves: Move[];
  onMoveSelected?: (moveIndex: number) => void;
}) {
  const [miniBoardX, setMiniBoardX] = useState(0);
  const [miniBoardY, setMiniBoardY] = useState(0);
  const [miniBoardVisible, setMiniBoardVisible] = useState(false);
  const [miniBoardFen, setMiniBoardFen] = useState(props.startingFen);

  return (
    <div className="flex-1 h-0 overflow-auto">
      {props.moves
        .reduce((acc, value, index, array) => {
          if (index % 2 === 0) {
            acc.push([value, array[index + 1]]);
          }

          return acc;
        }, [] as [Move, Move][])
        .map(([whiteMove, blackMove], i) => (
          <div key={i} className="flex items-center">
            <div className="w-6">{i + 1}.</div>

            <div className="w-2"></div>

            <div
              className={`w-14 font-bold rounded-sm cursor-pointer p-1 ${getMoveColor(
                {
                  activeMoveIndex: props.moveIndex,
                  renderMoveIndex: i * 2,
                  numMoves: props.moves.length,
                  numCustomMoves: props.numCustomMoves,
                }
              )}`}
              onClick={() => props.onMoveSelected?.(i * 2)}
              onPointerMove={(event) => {
                setMiniBoardX(event.clientX);
                setMiniBoardY(event.clientY);
              }}
              onPointerEnter={() => {
                try {
                  const game = new Chess(props.startingFen);

                  for (let j = 0; j < i * 2 + 1; j++) {
                    game.move(props.moves[j]);
                  }

                  setMiniBoardFen(game.fen());

                  setMiniBoardVisible(true);
                } catch {}
              }}
              onPointerLeave={() => setMiniBoardVisible(false)}
            >
              {whiteMove.san}
            </div>

            <div
              className={`w-14 font-bold rounded-sm cursor-pointer p-1 ${getMoveColor(
                {
                  activeMoveIndex: props.moveIndex,
                  renderMoveIndex: i * 2 + 1,
                  numMoves: props.moves.length,
                  numCustomMoves: props.numCustomMoves,
                }
              )}`}
              onClick={() => props.onMoveSelected?.(i * 2 + 1)}
              onPointerMove={(event) => {
                setMiniBoardX(event.clientX);
                setMiniBoardY(event.clientY);
              }}
              onPointerEnter={() => {
                try {
                  const game = new Chess(props.startingFen);

                  for (let j = 0; j < i * 2 + 2; j++) {
                    game.move(props.moves[j]);
                  }

                  setMiniBoardFen(game.fen());

                  setMiniBoardVisible(true);
                } catch {}
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
            <Chessboard position={miniBoardFen} />
          </div>
        </div>
      )}
    </div>
  );
}
