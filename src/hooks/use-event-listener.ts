import { useEffect } from "react";

export function useEventListener<K extends keyof DocumentEventMap>(
  document: () => Document,
  type: K,
  listener: (this: Document, ev: DocumentEventMap[K]) => any
): void;

export function useEventListener<K extends keyof WindowEventMap>(
  window: () => Window,
  type: K,
  listener: (this: Document, ev: WindowEventMap[K]) => any
): void;

export function useEventListener(
  target: () => any,
  type: string,
  listener: (...args: any[]) => any
) {
  useEffect(() => {
    target().addEventListener(type, listener);

    return () => {
      target().removeEventListener(type, listener);
    };
  }, []);
}
