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

export function useEventListener(...args: any[]) {
  useEffect(() => {
    args[0]().addEventListener(args[1], args[2]);

    return () => {
      args[0]().removeEventListener(args[1], args[2]);
    };
  }, []);
}
