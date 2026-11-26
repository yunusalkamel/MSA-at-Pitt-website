import { forwardRef, type ComponentPropsWithoutRef } from "react";

export const PageHero = forwardRef<HTMLElement, ComponentPropsWithoutRef<"section">>(
  function PageHero({ className = "", ...props }, ref) {
    return <section {...props} ref={ref} className={`page-hero ${className}`} />;
  },
);
