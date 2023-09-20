import { MoveScore } from "@/misc/types";
import { getScoreText, getSmoothScore } from "@/misc/chess";
import { BoardOrientation } from "@gustavotoyota/react-chessboard/dist/chessboard/types";

export default function EvaluationBar(props: {
  score: MoveScore;
  orientation: BoardOrientation;
}) {
  const whiteHeight = props.score.mate
    ? props.score.score > 0
      ? 100
      : 0
    : 50 + 50 * getSmoothScore(props.score);

  return (
    <div className="relative bg-neutral-600 w-8">
      <div
        className={`absolute ${
          props.orientation === "white" ? "bottom-0" : "top-0"
        } left-0 right-0 bg-neutral-100`}
        style={{
          height: `${whiteHeight}%`,
        }}
      ></div>

      <div
        className="absolute left-[50%] -translate-x-1/2 -translate-y-1/2 text-xs text-center"
        style={{
          top: `${Math.min(
            Math.max(
              3,
              props.orientation === "white"
                ? 100 - whiteHeight + 3
                : whiteHeight - 3
            ),
            97
          )}%`,
        }}
      >
        {getScoreText(props.score)}
      </div>
    </div>
  );
}
