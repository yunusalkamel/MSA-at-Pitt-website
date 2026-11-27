import { useEffect, useRef, useState } from "react";
import type { Fields } from "./content";

const widths = { desktop: 1440, tablet: 820, phone: 390 };
export type Device = keyof typeof widths;

export default function VisualPreview({ fields, path, device, onClose }: {
  fields: Fields; path: string; device: Device; onClose: () => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(widths[device]);
  const send = () => frame.current?.contentWindow?.postMessage({ type: "msa-visual-preview", fields }, location.origin);
  useEffect(() => { dialog.current?.showModal(); }, []);
  useEffect(() => { send(); }, [fields]);
  useEffect(() => {
    const wrapper = container.current;
    if (!wrapper) return;
    const observer = new ResizeObserver(([entry]) => setAvailable(entry.contentRect.width));
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);
  const width = widths[device];
  const scale = Math.min(1, available / width);
  return <dialog ref={dialog} className="msa-device-preview" onClose={onClose} aria-label={`${device} preview`}>
    <header><strong>{device[0].toUpperCase() + device.slice(1)} preview · {width}px</strong>
      <button type="button" autoFocus onClick={() => dialog.current?.close()}>Close preview</button></header>
    <div className="msa-preview-canvas" ref={container} style={{ height: 720 * scale }}>
      <iframe ref={frame} title="Website preview" src={`/admin${path}?visual-preview=1`}
        onLoad={send} style={{ width, height: 720, transform: `scale(${scale})` }} />
    </div>
  </dialog>;
}
