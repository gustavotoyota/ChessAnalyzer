import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useRef,
  useState,
} from "react";

export default function useStateWithRef<T = undefined>(initialState?: () => T) {
  let initialValue;

  if (initialState != null) {
    initialValue = initialState();
  }

  const [state, setState] = useState(initialValue) as [
    T,
    Dispatch<SetStateAction<T>>
  ];

  const ref = useRef(initialValue) as MutableRefObject<T>;

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
