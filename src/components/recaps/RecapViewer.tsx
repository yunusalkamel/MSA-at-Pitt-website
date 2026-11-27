import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { recapDate, type Recap } from "@/data/recaps";

const slideDuration = 5000;
type Props = {
  stories: Recap[];
  story: Recap;
  slide: number;
  opener: HTMLElement | null;
  onShow: (story: Recap, slide: number) => void;
  onOpen: (story: Recap) => void;
  onComplete: (story: Recap) => void;
  onClose: () => void;
};

export default function RecapViewer({ stories, story, slide, opener, onShow, onOpen, onComplete, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const elapsed = useRef(0);
  const pointer = useRef<{ id: number; x: number; y: number; at: number } | null>(null);
  const lastStory = useRef("");
  const completed = useRef(new Set<string>());
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [holding, setHolding] = useState(false);
  const [hidden, setHidden] = useState(() => document.hidden);
  const index = stories.findIndex(item => item.slug === story.slug);
  const current = story.slides[slide];
  const key = story.slug + ":" + slide;
  const end = slide === story.slides.length - 1;

  function resetProgress() {
    elapsed.current = 0;
    if (fill.current) fill.current.style.transform = "scaleX(0)";
  }

  function nextStory() {
    if (end && !completed.current.has(story.slug)) {
      completed.current.add(story.slug);
      onComplete(story);
    }
    const following = stories[index + 1];
    if (following) onShow(following, 0);
    else onClose();
  }

  function next() {
    if (end) nextStory();
    else onShow(story, slide + 1);
  }

  function previous() {
    if (slide > 0) onShow(story, slide - 1);
    else if (index > 0) onShow(stories[index - 1], stories[index - 1].slides.length - 1);
    else resetProgress();
  }

  const advance = useRef(next);
  advance.current = next;

  useLayoutEffect(() => {
    const modal = dialog.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modal?.showModal();
    closeButton.current?.focus();
    return () => {
      modal?.close();
      document.body.style.overflow = overflow;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [opener]);

  useEffect(() => {
    const visibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", visibility);
    return () => document.removeEventListener("visibilitychange", visibility);
  }, []);

  useEffect(() => {
    if (lastStory.current === story.slug) return;
    lastStory.current = story.slug;
    onOpen(story);
  }, [story, onOpen]);

  useLayoutEffect(resetProgress, [key]);

  const preload = story.slides[slide + 1] ?? stories[index + 1]?.slides[0];
  useEffect(() => {
    if (!preload) return;
    const image = new Image();
    image.src = preload.src;
  }, [preload]);

  useEffect(() => {
    if (reduced || paused || hidden || holding) return;
    let request: number;
    let last = performance.now();
    function tick(now: number) {
      if (document.hidden || pointer.current) {
        last = now;
      } else {
        elapsed.current += Math.max(0, now - last);
        last = now;
        const progress = Math.min(1, elapsed.current / slideDuration);
        if (fill.current) fill.current.style.transform = `scaleX(${progress})`;
        if (progress === 1) {
          advance.current();
          return;
        }
      }
      request = requestAnimationFrame(tick);
    }
    request = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(request);
  }, [key, reduced, paused, hidden, holding]);

  function startPointer(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, at: performance.now() };
    event.currentTarget.setPointerCapture(event.pointerId);
    setHolding(true);
  }

  function releasePointer(event: PointerEvent<HTMLDivElement>) {
    const start = pointer.current;
    if (!start || start.id !== event.pointerId) return;
    pointer.current = null;
    setHolding(false);
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (dy > 55 && dy > Math.abs(dx)) onClose();
    else if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) nextStory();
      else if (index > 0) onShow(stories[index - 1], 0);
      else resetProgress();
    } else if (Math.abs(dx) < 20 && Math.abs(dy) < 20 && performance.now() - start.at < 300) {
      const frame = event.currentTarget.getBoundingClientRect();
      if (event.clientX < frame.left + frame.width / 3) previous();
      else next();
    }
  }

  return createPortal(
    <dialog ref={dialog} className="recap-viewer" aria-modal="true" aria-label={story.title + " recap"}
      onCancel={event => { event.preventDefault(); onClose(); }}
      onClick={event => { if (event.target === dialog.current) onClose(); }}
      onKeyDown={event => {
        if (event.key === "Tab") {
          const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not([disabled])")]
            .filter(button => button.getClientRects().length > 0);
          const first = buttons[0];
          const last = buttons.at(-1);
          const active = document.activeElement;
          if (event.shiftKey ? active === first : active === last) {
            event.preventDefault();
            (event.shiftKey ? last : first)?.focus();
          }
        }
        if (event.key === "ArrowLeft") { event.preventDefault(); previous(); }
        if (event.key === "ArrowRight") { event.preventDefault(); next(); }
        if (event.code === "Space" && !reduced) { event.preventDefault(); setPaused(value => !value); }
      }}>
      <div className="recap-viewer-background" style={{ backgroundImage: `url(${current.src})` }} aria-hidden="true" />
      <div className="recap-viewer-panel">
        <div className="recap-progress" aria-hidden="true">
          {story.slides.map(({ src }, i) => <div key={src}><span ref={i === slide ? fill : undefined}
            style={{ transform: `scaleX(${i < slide ? 1 : 0})` }} /></div>)}
        </div>
        <header className="recap-viewer-header">
          <img src={story.cover} width={36} height={36} alt="" />
          <div><strong>{story.title}</strong><small>{recapDate(story.date)}</small></div>
          {!reduced && <button type="button" aria-label={paused ? "Play recap" : "Pause recap"} onClick={() => setPaused(value => !value)}>
            {paused ? <Play aria-hidden="true" size={19} /> : <Pause aria-hidden="true" size={19} />}
          </button>}
          <button type="button" ref={closeButton} aria-label="Close recap" onClick={onClose}><X aria-hidden="true" size={22} /></button>
        </header>
        <div className="recap-stage" onPointerDown={startPointer} onPointerUp={releasePointer}
          onPointerCancel={() => { pointer.current = null; setHolding(false); }}>
          <img key={key} src={current.src} alt={current.alt} draggable={false}
            style={{ aspectRatio: current.aspect }} />
        </div>
        <span className="sr-only" role="status">Slide {slide + 1} of {story.slides.length}</span>
        <button type="button" className="recap-arrow recap-arrow-prev" aria-label="Previous slide" onClick={previous}>
          <ChevronLeft aria-hidden="true" />
        </button>
        <button type="button" className="recap-arrow recap-arrow-next" aria-label="Next slide" onClick={next}>
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
    </dialog>,
    document.body,
  );
}
