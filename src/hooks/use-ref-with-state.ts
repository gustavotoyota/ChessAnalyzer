import { SetStateAction, useRef, useState } from "react";

export default function useStateWithRef<T>(initialState: T) {
  const [state, setState] = useState(initialState);

  const ref = useRef(initialState);

  return [
    state,
    (value: SetStateAction<T>) => {
      ref.current =
        typeof value === "function" ? (value as any)(ref.current) : value;

      setState(ref.current);
    },
    ref,
  ] as const;
}
