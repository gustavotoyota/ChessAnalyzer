import { ChessGame } from "@/core/chess-game";

import Button from "./button";

export default function GameNavigationUI(props: {
  game: ChessGame;
  onFlipBoard: () => void;
}) {
  <div className="flex">
    <Button value="Reset board (R)" onClick={() => props.game.reset()} />

    <div className="w-4" />

    <Button value="|<" onClick={() => props.game.goToStart()} />

    <div className="w-4" />

    <Button value="<" onClick={() => props.game.goBackward()} />

    <div className="w-2" />

    <Button value=">" onClick={() => props.game.goForward()} />

    <div className="w-4" />

    <Button value=">|" onClick={() => props.game.goToEnd()} />

    <div className="w-4" />

    <Button value="Flip board (F)" onClick={() => props.onFlipBoard()} />
  </div>;
}
