import { useEffect, useState, type RefObject } from "react";

/** Wait for the mounted hero's actual sources; fonts and image failures must fail open. */
export function useHeroReady(root: RefObject<HTMLElement>, version: unknown, criticalCount?: number) {
  const [ready,setReady] = useState(false);
  useEffect(()=> {
    let active = true;
    let finished = false;
    setReady(false);
    const finish = () => { if (active && !finished) { finished = true; clearTimeout(timeout); setReady(true); window.dispatchEvent(new Event("msa-hero-ready")); } };
    const timeout = window.setTimeout(finish,2500);
    const frame = requestAnimationFrame(()=> {
      const images = Array.from(root.current?.querySelectorAll<HTMLImageElement>("img") ?? []).slice(0,criticalCount ?? Infinity);
      const fonts = document.fonts ? [document.fonts.load('700 64px "Cormorant Garamond"'),document.fonts.load('400 64px "Pinyon Script"')] : [];
      void Promise.allSettled([...images.map(image=>image.decode()),...fonts]).then(finish);
    });
    return ()=> { active=false; clearTimeout(timeout); cancelAnimationFrame(frame); };
  },[root,version,criticalCount]);
  return ready;
}
