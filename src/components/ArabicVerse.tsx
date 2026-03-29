interface ArabicVerseProps {
  arabic: string;
  translation: string;
  reference: string;
  className?: string;
}

const ArabicVerse = ({ arabic, translation, reference, className = "" }: ArabicVerseProps) => {
  return (
    <div className={`text-center py-8 ${className}`}>
      <p className="font-arabic text-2xl md:text-3xl lg:text-4xl text-foreground/80 leading-relaxed mb-4" dir="rtl">
        {arabic}
      </p>
      <p className="italic text-muted-foreground text-base md:text-lg">
        "{translation}" — {reference}
      </p>
    </div>
  );
};

export default ArabicVerse;
