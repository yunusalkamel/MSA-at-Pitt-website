/** AppLoader — shown while the JS bundle loads (Suspense fallback). */
const AppLoader = () => (
  <div
    className="fixed inset-0 flex flex-col items-center justify-center gap-3 z-50"
    style={{ background: "linear-gradient(160deg, #060B18 0%, #0D1528 55%, #101E38 100%)" }}
  >
    {/* Gold progress bar at the very top */}
    <div
      className="absolute top-0 left-0 h-[3px] animate-[progress_1.4s_ease-in-out_infinite]"
      style={{ background: "linear-gradient(90deg, #F2AB23, #E8960A)", width: "65%" }}
    />

    {/* Bismillah */}
    <p
      className="font-arabic text-3xl md:text-4xl leading-relaxed"
      dir="rtl"
      style={{ color: "rgba(242,171,35,0.85)" }}
    >
      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
    </p>

    {/* Site title */}
    <p
      className="font-display text-base font-semibold tracking-[0.18em] uppercase"
      style={{ color: "rgba(255,255,255,0.38)" }}
    >
      Muslim Student Association · Pitt
    </p>
  </div>
);

export default AppLoader;
