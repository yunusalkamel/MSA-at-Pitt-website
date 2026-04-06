interface ArabicVerseProps {
  arabic: string;
  translation: string;
  reference: string;
  className?: string;
  compact?: boolean;
}

const ArabicVerse = ({
  arabic,
  translation,
  reference,
  className = "",
  compact = false,
}: ArabicVerseProps) => {
  return (
    <div className={`text-center ${compact ? "py-2" : "py-6"} ${className}`}>
      {/* Decorative rule */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="w-12 h-px bg-gradient-to-r from-transparent to-primary/30" />
        <div className="w-1 h-1 rounded-full bg-primary/40" />
        <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
        <div className="w-1 h-1 rounded-full bg-primary/40" />
        <div className="w-12 h-px bg-gradient-to-l from-transparent to-primary/30" />
      </div>

      <p
        className={`font-arabic text-foreground/80 leading-relaxed mb-4 ${
          compact ? "text-xl md:text-2xl" : "text-2xl md:text-3xl lg:text-4xl"
        }`}
        dir="rtl"
      >
        {arabic}
      </p>

      <p className={`italic text-muted-foreground ${compact ? "text-sm" : "text-base md:text-lg"}`}>
        "{translation}"
      </p>
      <p className="text-xs text-muted-foreground/60 font-semibold uppercase tracking-widest mt-2">
        {reference}
      </p>

      {/* Closing rule */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <div className="w-8 h-px bg-gradient-to-r from-transparent to-primary/20" />
        <div className="w-1 h-1 rounded-full bg-primary/30" />
        <div className="w-8 h-px bg-gradient-to-l from-transparent to-primary/20" />
      </div>
    </div>
  );
};

export default ArabicVerse;
