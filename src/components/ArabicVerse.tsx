interface ArabicVerseProps {
  arabic: string;
  translation: string;
  reference: string;
  className?: string;
  compact?: boolean;
  buttonText?: string;
  buttonHref?: string;
  buttonOnClick?: () => void;
  buttonClassName?: string;
}

const ArabicVerse = ({
  arabic,
  translation,
  reference,
  className = "",
  compact = false,
  buttonText,
  buttonHref,
  buttonOnClick,
  buttonClassName = "",
}: ArabicVerseProps) => {
  return (
    <div
      className={`text-center flex flex-col items-center ${
        compact ? "py-1 gap-2" : "py-3 gap-3"
      } ${className}`}
    >
      {/* Decorative rule */}
      <div className={`flex items-center justify-center gap-3 ${compact ? "mb-2" : "mb-4"}`}>
        <div className="w-12 h-px bg-gradient-to-r from-transparent to-primary/30" />
        <div className="w-1 h-1 rounded-full bg-primary/40" />
        <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
        <div className="w-1 h-1 rounded-full bg-primary/40" />
        <div className="w-12 h-px bg-gradient-to-l from-transparent to-primary/30" />
      </div>

      <p
        className={`font-arabic text-[#8A6212] relative z-10 ${
          compact
            ? "text-xl md:text-2xl leading-[1.35]"
            : "text-2xl md:text-3xl lg:text-4xl leading-[1.35]"
        }`}
        dir="rtl"
      >
        {arabic}
      </p>

      <p className={`italic text-muted-foreground max-w-2xl ${compact ? "text-sm" : "text-base md:text-lg"}`}>
        "{translation}"
      </p>
      <p className="text-xs text-muted-foreground/60 font-semibold uppercase tracking-widest">
        {reference}
      </p>

      {buttonText && (buttonHref || buttonOnClick) && (
        buttonHref ? (
          <a
            href={buttonHref}
            onClick={buttonOnClick}
            className={`inline-flex items-center justify-center rounded-full border border-[#8A6212]/35 bg-[#8A6212]/10 px-5 py-2 text-sm font-semibold text-[#8A6212] transition-all duration-200 hover:bg-[#8A6212] hover:text-black ${buttonClassName}`}
          >
            {buttonText}
          </a>
        ) : (
          <button
            type="button"
            onClick={buttonOnClick}
            className={`inline-flex items-center justify-center rounded-full border border-[#8A6212]/35 bg-[#8A6212]/10 px-5 py-2 text-sm font-semibold text-[#8A6212] transition-all duration-200 hover:bg-[#8A6212] hover:text-black ${buttonClassName}`}
          >
            {buttonText}
          </button>
        )
      )}

      {/* Closing rule */}
      <div className={`flex items-center justify-center gap-3 ${compact ? "mt-1" : "mt-2"}`}>
        <div className="w-8 h-px bg-gradient-to-r from-transparent to-primary/20" />
        <div className="w-1 h-1 rounded-full bg-primary/30" />
        <div className="w-8 h-px bg-gradient-to-l from-transparent to-primary/20" />
      </div>
    </div>
  );
};

export default ArabicVerse;
