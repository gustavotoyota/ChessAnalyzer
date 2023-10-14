import { Arrow } from "@gustavotoyota/react-chessboard/dist/chessboard/types";

import { ChessLine } from "./types";

export function getArrowsFromBestLines(input: {
  bestLines: Map<number, ChessLine>;
  stockfishThreatsEnabled?: boolean;
}): Arrow[] {
  const arrows: Arrow[] = [];

  const moveSet = new Set<string>();

  for (const [index, line] of Array.from(input.bestLines.entries())) {
    if (moveSet.has(line.moves[0].lan)) {
      continue;
    }

    arrows.push({
      from: line.moves[0].from,
      to: line.moves[0].to,

      color: input.stockfishThreatsEnabled ? "#c00000" : "#003088",
      width: `${(16 - 2 * index) / 16}rem`,
      opacity: 0.4 - 0.05 * index,

      text: line.scoreText,
      textColor: input.stockfishThreatsEnabled ? "#0000b8" : "#b80000",
      fontSize: "1rem",
      fontWeight: "bold",
    });

    moveSet.add(line.moves[0].lan);
  }

  return arrows;
}
