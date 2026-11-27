const nativeWidths: Record<string, number> = {
  "fajr-bridge": 1024,
  "riverside-breakfast": 1074,
  "river-talk": 1152,
  "river-speaker": 864,
  "fall-walk": 1158,
  "friends-dusk": 902,
  "serving": 1016,
  "friendsgiving-food": 902
};

export function communityImageSizes(src: string, phoneWall = false) {
  const match = /^\/photos\/community\/([\w-]+)\.webp$/.exec(src);
  if (!match) return undefined;
  const base = src.slice(0, -5);
  if (phoneWall) return `${base}-320.webp 320w, ${base}-480.webp 480w`;
  return `${base}-320.webp 320w, ${base}-720.webp 720w, ${src} ${nativeWidths[match[1]] ?? 1280}w`;
}
