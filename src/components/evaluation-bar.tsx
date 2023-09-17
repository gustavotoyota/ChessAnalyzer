import { getScoreText } from "@/misc/utils";

function smoothScore(score: number) {
  return 2 / (1 + Math.exp(-0.00368208 * score)) - 1;
}

export default function EvaluationBar(props: { mate: boolean; score: number }) {
  return (
    <div className="relative bg-neutral-600 w-7">
      <div
        className="absolute bottom-0 left-0 right-0 bg-neutral-100"
        style={{
          height: props.mate
            ? props.score > 0
              ? "100%"
              : "0%"
            : `${50 + 50 * smoothScore(props.score)}%`,
        }}
      ></div>

      <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 text-xs text-center  ">
        {getScoreText({ mate: props.mate, score: props.score })}
      </div>
    </div>
  );
}
