/**
 * The Bridge Bar — the signature gold→jannah gradient line.
 * 3px tall, transitions from MSA Gold to Jannah Mid with transparent edges.
 */

const BridgeBar = ({ className = "" }: { className?: string }) => (
  <div
    className={`absolute top-0 left-0 right-0 h-[3px] z-10 ${className}`}
    style={{
      background: "linear-gradient(90deg, transparent, #F2AB23 25%, #148066 75%, transparent)",
    }}
    aria-hidden="true"
  />
);

export default BridgeBar;
