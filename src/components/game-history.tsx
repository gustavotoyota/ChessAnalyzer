import { Move } from "chess.js";

export default function GameHistory(props: {
  moveIndex: number;
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
          <div key={i} className="flex">
            <div className="w-6">{i + 1}.</div>

            <div className="w-2"></div>

            <div
              className={`w-12 font-bold rounded-sm cursor-pointer p-1 ${
                props.moveIndex === i * 2 ? "bg-white/40" : ""
              }`}
              onClick={() => props.onMoveSelected?.(i * 2)}
            >
              {whiteMove.san}
            </div>

            <div className="w-2"></div>

            <div
              className={`w-12 font-bold rounded-sm cursor-pointer p-1 ${
                props.moveIndex === i * 2 + 1 ? "bg-white/40" : ""
              }`}
              onClick={() => props.onMoveSelected?.(i * 2 + 1)}
            >
              {blackMove?.san ?? ""}
            </div>
          </div>
        ))}
    </div>
  );
}
