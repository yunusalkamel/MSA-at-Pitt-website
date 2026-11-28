import { useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

export function useHeroParallax(distance = 48) {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const offset = useTransform(scrollY, [0, 650], [0, distance]);
  const smooth = useSpring(offset, { stiffness: 140, damping: 32, mass: 0.4 });
  return reduced ? undefined : smooth;
}
