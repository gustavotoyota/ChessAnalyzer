import { Move } from "chess.js";

export type ChessLine = {
  moves: Move[];
  mate: boolean;
  score: number;
  scoreText: string;
};

export default function ChessLines(props: { lines: ChessLine[] }) {
  return (
    <>
      {Array.from(props.lines.values()).map((line, i) => (
        <div
          key={i}
          className="border-b border-neutral-400 py-1 overflow-hidden overflow-ellipsis whitespace-nowrap"
        >
          <span className="font-bold">{line.scoreText}</span>

          <div className="inline-block w-2"></div>

          {line.moves.map((move, i) => (
            <span key={i}>
              <span>{move.san}</span>

              <div className="inline-block w-1"></div>
            </span>
          ))}
        </div>
      ))}
    </>
  );
}
