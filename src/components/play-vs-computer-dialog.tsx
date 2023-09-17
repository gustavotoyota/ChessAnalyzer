import { useState } from "react";
import Button from "./button";
import Dialog from "./dialog";

export default function PlayVsComputerDialog(props: {
  onClose?: () => void;
  onPlay?: (config: { elo: number; color: "white" | "black" }) => void;
}) {
  const [elo, setElo] = useState(1320);

  const [color, setColor] = useState<"white" | "black">("white");

  return (
    <Dialog
      onClose={props.onClose}
      title="Play vs. computer"
      body={
        <>
          <div className="text-center">
            <b>Computer elo:</b> {elo}
          </div>

          <div className="h-1"></div>

          <input
            type="range"
            className="w-full"
            min={1320}
            max={3190}
            value={elo}
            onChange={(event) => setElo(event.target.value as any)}
          />

          <div className="h-3" />

          <div className="text-center">
            <b>You will play as:</b>
          </div>

          <div className="h-1" />

          <div className="flex justify-center">
            <label htmlFor="white">
              <input
                id="white"
                type="radio"
                value="white"
                name="color"
                checked={color === "white"}
                onChange={(event) => setColor(event.target.value as any)}
              />{" "}
              White
            </label>

            <div className="w-4" />

            <label htmlFor="black">
              <input
                id="black"
                type="radio"
                value="black"
                name="color"
                checked={color === "black"}
                onChange={(event) => setColor(event.target.value as any)}
              />{" "}
              Black
            </label>
          </div>
        </>
      }
      footer={
        <>
          <Button
            value="Cancel"
            className="bg-red-600 hover:bg-red-800"
            onClick={props.onClose}
          />

          <div className="w-3" />

          <Button
            value="Play"
            onClick={() => {
              props.onPlay?.({ elo, color });

              props.onClose?.();
            }}
          />
        </>
      }
    />
  );
}
