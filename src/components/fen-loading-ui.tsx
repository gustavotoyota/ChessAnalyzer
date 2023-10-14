import { useEffect, useState } from "react";

import Button from "./button";

export default function FenLoadingUI(props: {
  fen: string;
  onLoad: (pgn: string) => void;
}) {
  const [inputFen, setInputFen] = useState(() => props.fen);

  useEffect(() => {
    setInputFen(props.fen);
  }, [props.fen]);

  return (
    <div className="flex">
      <input
        className="w-80 bg-neutral-600 px-3 py-2 rounded-md text-neutral-200 text-sm outline-none"
        placeholder="Paste FEN here"
        type="text"
        value={props.fen}
        onChange={(event) => setInputFen(event.target.value)}
      />

      <div className="w-4" />

      <Button value="Import FEN" onClick={() => props.onLoad(inputFen)} />
    </div>
  );
}
