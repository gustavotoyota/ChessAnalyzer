import { Move } from "chess.js";

export type ChessLine = {
  moves: Move[];
  mate: boolean;
  score: number;
  scoreText: string;
};

export default function ChessLines(props: {
  lines: Map<number, ChessLine>;
  onMovesSelected?: (moves: Move[]) => void;
}) {
  return (
    <>
      {Array.from(props.lines.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([_, line], i) => (
          <div
            key={i}
            className="border-b border-neutral-400 py-1 overflow-hidden overflow-ellipsis whitespace-nowrap"
          >
            <span
              className="font-bold cursor-pointer select-none"
              onClick={() => props.onMovesSelected?.(line.moves.slice(0, 1))}
            >
              {line.scoreText}
            </span>

            <div className="inline-block w-2"></div>

            {line.moves.map((move, i) => (
              <span key={i}>
                <span
                  className="cursor-pointer select-none"
                  onClick={() =>
                    props.onMovesSelected?.(line.moves.slice(0, i + 1))
                  }
                >
                  {move.san}
                </span>

                <div className="inline-block w-1"></div>
              </span>
            ))}
          </div>
        ))}
    </>
  );
}
