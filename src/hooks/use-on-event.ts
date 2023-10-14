import { useEffect } from "react";

export function useOnEvent(
  obj: () => any,
  type: string,
  listener: (...args: any[]) => any
): void {
  useEffect(() => {
    obj().on(type, listener);

    return () => {
      obj().off(type, listener);
    };
  }, []);
}
