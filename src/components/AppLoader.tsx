/**
 * AppLoader — splash screen shown while the JS bundle loads (Suspense fallback).
 *
 * Change the `variant` prop on the export at the bottom to switch between:
 *   "logo"      — MSA logo centered with a gold glow pulse     (Option A)
 *   "bismillah" — Arabic text + "MSA at Pitt" on dark bg       (Option B)
 *   "bar"       — Thin gold progress bar at the very top only  (Option C)
 */

const LogoVariant = () => (
  <div
    className="fixed inset-0 flex flex-col items-center justify-center z-50"
    style={{ background: "linear-gradient(160deg, #060B18 0%, #0D1528 55%, #101E38 100%)" }}
  >
    <div className="relative flex items-center justify-center">
      {/* Glow ring */}
      <div
        className="absolute w-36 h-36 rounded-full animate-pulse"
        style={{ background: "radial-gradient(circle, rgba(242,171,35,0.18) 0%, transparent 70%)" }}
      />
      <img
        src="/msa-logo-white.png"
        alt="MSA at Pitt"
        className="h-20 w-auto object-contain relative z-10"
      />
    </div>
    <p className="mt-4 font-display text-xl font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>
      MSA at Pitt
    </p>
  </div>
);

const BismillahVariant = () => (
  <div
    className="fixed inset-0 flex flex-col items-center justify-center gap-3 z-50"
    style={{ background: "linear-gradient(160deg, #060B18 0%, #0D1528 55%, #101E38 100%)" }}
  >
    <p
      className="font-arabic text-3xl md:text-4xl leading-relaxed"
      dir="rtl"
      style={{ color: "rgba(242,171,35,0.85)" }}
    >
      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
    </p>
    <p className="font-display text-lg font-semibold tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>
      MSA at Pitt
    </p>
  </div>
);

const BarVariant = () => (
  <div className="fixed inset-0 bg-background z-50">
    <div
      className="absolute top-0 left-0 h-[3px] animate-[progress_1.2s_ease-in-out_infinite]"
      style={{ background: "linear-gradient(90deg, #F2AB23, #E8960A)", width: "70%" }}
    />
  </div>
);

// ─── CHANGE THIS to "logo", "bismillah", or "bar" to see each option ──────────
const ACTIVE_VARIANT: "logo" | "bismillah" | "bar" = "bismillah";
// ─────────────────────────────────────────────────────────────────────────────

const AppLoader = () => {
  if (ACTIVE_VARIANT === "logo") return <LogoVariant />;
  if (ACTIVE_VARIANT === "bar") return <BarVariant />;
  return <BismillahVariant />;
};

export default AppLoader;
