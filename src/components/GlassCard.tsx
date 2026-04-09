import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  liquid?: boolean;
}

const GlassCard = ({ children, className = "", hover = true, delay = 0, liquid = false }: GlassCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`${hover ? (liquid ? "liquid-glass" : "glass-card-hover") : (liquid ? "liquid-glass" : "glass-card")} p-6 md:p-8 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
