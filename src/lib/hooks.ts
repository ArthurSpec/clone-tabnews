import { useEffect, useRef, useState } from "react";

/** Largura observada de um elemento (para gráficos SVG responsivos). */
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Executa uma sequência de passos com atraso, cancelando ao desmontar. */
export function useTimeouts() {
  const ids = useRef<number[]>([]);
  useEffect(() => () => ids.current.forEach(clearTimeout), []);
  return (fn: () => void, ms: number) => {
    ids.current.push(window.setTimeout(fn, ms));
  };
}
