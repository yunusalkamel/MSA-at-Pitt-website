import { useEffect, useRef, useState } from "react";
import type { Fields } from "./content";

const widths = { desktop: 1440, tablet: 820, phone: 390 };
export type Device = keyof typeof widths;

function Canvas({ fields, path, device, title }: {fields:Fields; path:string; device:Device; title:string}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(widths[device]);
  const send = () => frame.current?.contentWindow?.postMessage({ type: "msa-visual-preview", fields }, location.origin);
  useEffect(() => {
    const ready = (event:MessageEvent) => {
      if (event.origin === location.origin && event.source === frame.current?.contentWindow && event.data?.type === "msa-preview-ready") send();
    };
    window.addEventListener("message",ready);
    send();
    return () => window.removeEventListener("message",ready);
  }, [fields]);
  useEffect(() => {
    const wrapper = container.current;
    if (!wrapper) return;
    const observer = new ResizeObserver(([entry]) => setAvailable(entry.contentRect.width));
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);
  const width = widths[device];
  const scale = Math.min(1, available / width);
  return <div>
    <p>{title}</p>
    <div className="msa-preview-canvas" ref={container} style={{ height: 720 * scale }}>
      <iframe ref={frame} title={title} src={`/admin${path}?visual-preview=1`}
        onLoad={send} style={{ width, height: 720, transform: `scale(${scale})` }} />
    </div>
  </div>;
}

export default function VisualPreview({ fields, compare, path, device, onClose }: {
  fields: Fields; compare?:Fields; path: string; device: Device; onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} className="msa-device-preview" onClose={onClose} aria-label={`${device} preview`}>
    <header><strong>{device[0].toUpperCase() + device.slice(1)} preview · {widths[device]}px</strong>
      <button type="button" autoFocus onClick={() => dialog.current?.close()}>Close preview</button></header>
    <div className={compare ? "msa-preview-compare" : undefined}>
      {compare && <Canvas fields={compare} path={path} device={device} title="A · Published design"/>}
      <Canvas fields={fields} path={path} device={device} title={compare ? "B · Working design" : "Website preview"}/>
    </div>
  </dialog>;
}
