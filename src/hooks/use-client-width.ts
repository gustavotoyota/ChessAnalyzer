import { useEffect, useState } from "react";

import { useEventListener } from "./use-event-listener";

export default function useInnerWidth() {
  const [innerWidth, setInnerWidth] = useState(0);

  useEffect(() => {
    setInnerWidth(window.innerWidth);
  }, []);

  useEventListener(
    () => window,
    "resize",
    () => setInnerWidth(window.innerWidth)
  );

  return innerWidth;
}
