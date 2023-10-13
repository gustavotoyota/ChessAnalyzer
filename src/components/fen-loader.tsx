import Button from "./button";

export default function FenLoader(props: {
  fen: string;
  onChange: (fen: string) => void;
  onLoad: (pgn: string) => void;
}) {
  return (
    <div className="flex">
      <input
        className="w-80 bg-neutral-600 px-3 py-2 rounded-md text-neutral-200 text-sm outline-none"
        placeholder="Paste FEN here"
        type="text"
        value={props.fen}
        onChange={(event) => props.onChange(event.target.value)}
      />

      <div className="w-4" />

      <Button value="Import FEN" onClick={() => props.onLoad(props.fen)} />
    </div>
  );
}
