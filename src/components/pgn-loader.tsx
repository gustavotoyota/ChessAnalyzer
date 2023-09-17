import { useState } from "react";
import Button from "./button";

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

      <Button value="Import PGN" onClick={() => props.onLoad(pgn)} />
    </div>
  );
}
