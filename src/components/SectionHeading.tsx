import { motion } from "framer-motion";

interface SectionHeadingProps {
  label?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  className?: string;
}

const SectionHeading = ({ label, title, subtitle, center = true, className = "" }: SectionHeadingProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className={`mb-10 md:mb-12 ${center ? "text-center" : ""} ${className}`}
    >
      {label && (
        <span className="text-xs uppercase tracking-[0.22em] text-secondary font-semibold mb-3 block">
          {label}
        </span>
      )}
      <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

export default SectionHeading;
