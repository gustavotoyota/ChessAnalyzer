import { useState } from "react";

export default function PgnLoader(props: { onLoad: (pgn: string) => void }) {
  const [pgn, setPgn] = useState("");

  return (
    <div className="flex">
      <textarea
        className="w-80 h-20 bg-neutral-600 px-3 py-2 rounded-md resize-none text-neutral-200 text-sm outline-none"
        placeholder="Paste PGN here"
        value={pgn}
        onChange={(e) => setPgn(e.target.value)}
      />

      <div className="w-4" />

      <input
        type="button"
        value="Import PGN"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => props.onLoad(pgn)}
      />
    </div>
  );
}
