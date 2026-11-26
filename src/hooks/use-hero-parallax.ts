import { useReducedMotion, useScroll, useTransform } from "framer-motion";

export function useHeroParallax(distance = 48) {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const offset = useTransform(scrollY, [0, 650], [0, distance]);
  return reduced ? undefined : offset;
}
