import { useState } from "react";

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

      <input
        type="button"
        value="Import FEN"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => props.onLoad(fen)}
      />
    </div>
  );
}
