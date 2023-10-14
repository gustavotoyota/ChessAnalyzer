import { MutableRefObject, useRef } from "react";

export default function useValueRef<T = undefined>(
  initialValue?: () => T
): MutableRefObject<T> {
  const ref = useRef() as MutableRefObject<T>;

  if (ref.current == null && initialValue != null) {
    ref.current = initialValue();
  }

  return ref;
}
