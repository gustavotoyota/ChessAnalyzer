import { ChessLine, MoveScore } from "@/misc/types";
import { Chessboard } from "@gustavotoyota/react-chessboard";
import { Chess, Move } from "chess.js";
import { useState } from "react";

export default function ChessLines(props: {
  startingFen: string;
  lines: Map<number, ChessLine>;
  onMovesSelected?: (moves: Move[]) => void;
}) {
  const [miniBoardX, setMiniBoardX] = useState(0);
  const [miniBoardY, setMiniBoardY] = useState(0);
  const [miniBoardVisible, setMiniBoardVisible] = useState(false);
  const [miniBoardFen, setMiniBoardFen] = useState(props.startingFen);

  return (
    <>
      {[0, 1, 2, 3, 4]
        .map((i) => props.lines.get(i)!)
        .map((line, i) => (
          <div
            key={i}
            className="border-b border-neutral-400 overflow-hidden overflow-ellipsis whitespace-nowrap"
          >
            {line != null ? (
              <>
                <span
                  className="font-bold cursor-pointer p-1 pr-2"
                  onClick={() =>
                    props.onMovesSelected?.(line.moves.slice(0, 1))
                  }
                  onPointerMove={(event) => {
                    setMiniBoardX(event.clientX);
                    setMiniBoardY(event.clientY);
                  }}
                  onPointerEnter={() => {
                    try {
                      setMiniBoardFen(props.startingFen);

                      setMiniBoardVisible(true);
                    } catch {}
                  }}
                  onPointerLeave={() => setMiniBoardVisible(false)}
                >
                  {line.scoreText}
                </span>

                {line.moves.map((move, i) => (
                  <div
                    key={i}
                    className="inline-block cursor-pointer p-1 hover:bg-white/20 rounded-sm"
                    onClick={() =>
                      props.onMovesSelected?.(line.moves.slice(0, i + 1))
                    }
                    onPointerMove={(event) => {
                      setMiniBoardX(event.clientX);
                      setMiniBoardY(event.clientY);
                    }}
                    onPointerEnter={() => {
                      try {
                        const game = new Chess(props.startingFen);

                        for (let j = 0; j < i + 1; j++) {
                          game.move(line.moves[j]);
                        }

                        setMiniBoardFen(game.fen());

                        setMiniBoardVisible(true);
                      } catch {}
                    }}
                    onPointerLeave={() => setMiniBoardVisible(false)}
                  >
                    {move.san}
                  </div>
                ))}
              </>
            ) : (
              <div className="inline-block p-1">&nbsp;</div>
            )}
          </div>
        ))}

      {miniBoardVisible && (
        <div
          className="fixed p-1 bg-neutral-400"
          style={{ left: `${miniBoardX - 64}px`, top: `${miniBoardY + 24}px` }}
        >
          <div className="w-32 h-32">
            <Chessboard position={miniBoardFen} />
          </div>
        </div>
      )}
    </>
  );
}
