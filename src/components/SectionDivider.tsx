const SectionDivider = ({ className = "" }: { className?: string }) => (
  <div className={`relative h-0 z-20 ${className}`}>
    <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
      <div className="w-44 md:w-96 h-[3px] bg-gradient-to-r from-transparent to-primary/20" />
      <span className="w-1.5 h-1.5 rounded-full bg-primary/30 flex-shrink-0" />
      <span className="w-2 h-2 rounded-full bg-primary/45 flex-shrink-0" />
      <span className="w-1.5 h-1.5 rounded-full bg-primary/30 flex-shrink-0" />
      <div className="w-44 md:w-96 h-[3px] bg-gradient-to-l from-transparent to-primary/20" />
    </div>
  </div>
);

export default SectionDivider;
