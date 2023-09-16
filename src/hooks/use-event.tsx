import { useEffect } from "react";

export function useEvent<K extends keyof DocumentEventMap>(
  type: K,
  listener: (this: Document, ev: DocumentEventMap[K]) => any
) {
  useEffect(() => {
    document.addEventListener(type, listener);

    return () => {
      document.removeEventListener(type, listener);
    };
  }, []);
}
