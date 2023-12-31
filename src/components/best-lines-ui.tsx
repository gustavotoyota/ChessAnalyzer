import { Chessboard } from "@gustavotoyota/react-chessboard";
import { BoardOrientation } from "@gustavotoyota/react-chessboard/dist/chessboard/types";
import { Chess } from "chess.js";
import { useState } from "react";

import { ChessGame } from "@/core/chess-game";
import { ChessLine } from "@/core/types";

export default function ChessLines(props: {
  gameMutable: ChessGame;
  gameState: ChessGame;
  lines: Map<number, ChessLine>;
  boardOrientation: BoardOrientation;
}) {
  const [miniBoardX, setMiniBoardX] = useState(0);
  const [miniBoardY, setMiniBoardY] = useState(0);
  const [miniBoardVisible, setMiniBoardVisible] = useState(false);
  const [miniBoardFen, setMiniBoardFen] = useState(props.gameState.fen);

  return (
    <>
      {[0, 1, 2, 3, 4]
        .map((i) => props.lines.get(i)!)
        .map((line, i) => (
          <div
            key={i}
            className="border-b border-neutral-400 overflow-hidden overflow-ellipsis whitespace-nowrap"
          >
            {line != null && (
              <>
                <span
                  className="font-bold cursor-pointer p-1 pr-2"
                  onClick={() => {
                    props.gameMutable.executeMoves(line.moves.slice(0, 1));

                    setMiniBoardVisible(false);
                  }}
                  onPointerMove={(event) => {
                    setMiniBoardX(event.clientX);
                    setMiniBoardY(event.clientY);
                  }}
                  onPointerEnter={() => {
                    try {
                      setMiniBoardFen(props.gameMutable.fen);

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
                    onClick={() => {
                      props.gameMutable.executeMoves(
                        line.moves.slice(0, i + 1)
                      );

                      setMiniBoardVisible(false);
                    }}
                    onPointerMove={(event) => {
                      setMiniBoardX(event.clientX);
                      setMiniBoardY(event.clientY);
                    }}
                    onPointerEnter={() => {
                      try {
                        const game = new Chess(props.gameMutable.fen);

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
                &nbsp;
              </>
            )}

            <div className="inline-block p-1">&nbsp;</div>
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
    </>
  );
}
