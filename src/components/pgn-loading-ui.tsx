import { useEffect, useState } from "react";

import Button from "./button";

export default function PgnLoadingUI(props: {
  pgn: string;
  onLoad: (pgn: string) => void;
}) {
  const [inputPgn, setInputPgn] = useState(() => props.pgn);

  useEffect(() => {
    setInputPgn(props.pgn);
  }, [props.pgn]);

  return (
    <div className="flex">
      <textarea
        className="w-80 h-20 bg-neutral-600 px-3 py-2 rounded-md resize-none text-neutral-200 text-sm outline-none"
        placeholder="Paste PGN here"
        value={inputPgn}
        onChange={(event) => setInputPgn(event.target.value)}
      />

      <div className="w-4" />

      <Button value="Import PGN" onClick={() => props.onLoad(inputPgn)} />
    </div>
  );
}
