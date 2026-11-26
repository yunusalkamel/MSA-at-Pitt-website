import { useSyncExternalStore } from "react";
type Theme = "light" | "dark";
type Trial = { id: string; src: string; title: string };
const sets: Record<Theme, Trial[]> = { light: [], dark: [] };
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function useHeroTrials(theme: Theme) {
  return useSyncExternalStore(subscribe, () => sets[theme]);
}
export function setHeroTrials(theme: Theme, files: File[]) {
  for (const old of sets[theme]) URL.revokeObjectURL(old.src);
  sets[theme] = files
    .filter((f) => f.type.startsWith("image/"))
    .map((file, i) => ({
      id: "trial-" + i,
      src: URL.createObjectURL(file),
      title: file.name.replace(/\.[^.]+$/, ""),
    }));
  for (const listener of listeners) listener();
}
