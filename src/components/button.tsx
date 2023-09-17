import { MouseEventHandler } from "react";

export default function Button(props: {
  value: string;
  onClick?: MouseEventHandler<HTMLInputElement>;
  className?: string;
}) {
  return (
    <input
      type="button"
      value={props.value}
      className={`bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded ${props.className}`}
      onClick={props.onClick}
    />
  );
}
