import { useEffect, useState } from "react";

import { ChessGame } from "@/core/chess-game";
import { StockfishWrapper } from "@/core/stockfish-wrapper";
import { ChessLine } from "@/core/types";

import useValueRef from "./use-value-ref";

export default function useStockfishWrapper(props: { realGame: ChessGame }) {
  const stockfishWrapper = useValueRef(
    () => new StockfishWrapper({ realGame: props.realGame })
  );

  const [bestLines, setBestLines] = useState<Map<number, ChessLine>>(new Map());

  function _onUpdate(bestLines: Map<number, ChessLine>) {
    setBestLines(new Map(bestLines));
  }

  useEffect(() => {
    const stockfish = new Worker("stockfish-nnue-16.js");

    stockfishWrapper.current.init({ stockfish });

    stockfishWrapper.current.on("best-lines", _onUpdate);

    return () => {
      stockfishWrapper.current.off("best-lines", _onUpdate);
    };
  }, []);

  return {
    stockfishWrapper,
    bestLines,
  };
}
