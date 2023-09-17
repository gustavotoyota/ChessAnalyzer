import { Move } from "chess.js";

function getMoveColor(params: {
  activeMoveIndex: number;
  renderMoveIndex: number;
  numMoves: number;
  numCustomMoves: number;
}) {
  if (params.renderMoveIndex > params.numMoves - 1) {
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
  moveIndex: number;
  numCustomMoves: number;
  moves: Move[];
  onMoveSelected?: (moveIndex: number) => void;
}) {
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
              className={`w-12 font-bold rounded-sm cursor-pointer p-1 ${getMoveColor(
                {
                  activeMoveIndex: props.moveIndex,
                  renderMoveIndex: i * 2,
                  numMoves: props.moves.length,
                  numCustomMoves: props.numCustomMoves,
                }
              )}`}
              onClick={() => props.onMoveSelected?.(i * 2)}
            >
              {whiteMove.san}
            </div>

            <div className="w-2"></div>

            <div
              className={`w-12 font-bold rounded-sm cursor-pointer p-1 ${getMoveColor(
                {
                  activeMoveIndex: props.moveIndex,
                  renderMoveIndex: i * 2 + 1,
                  numMoves: props.moves.length,
                  numCustomMoves: props.numCustomMoves,
                }
              )}`}
              onClick={() => props.onMoveSelected?.(i * 2 + 1)}
            >
              {blackMove?.san ?? ""}
            </div>
          </div>
        ))}
    </div>
  );
}
