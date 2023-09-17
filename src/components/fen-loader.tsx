import { useState } from "react";
import Button from "./button";

export default function FenLoader(props: { onLoad: (pgn: string) => void }) {
  const [fen, setFen] = useState("");

  return (
    <div className="flex">
      <input
        className="w-80 bg-neutral-600 px-3 py-2 rounded-md text-neutral-200 text-sm outline-none"
        placeholder="Paste FEN here"
        type="text"
        value={fen}
        onChange={(input) => setFen(input.target.value)}
      />

      <div className="w-4" />

      <Button value="Import FEN" onClick={() => props.onLoad(fen)} />
    </div>
  );
}
