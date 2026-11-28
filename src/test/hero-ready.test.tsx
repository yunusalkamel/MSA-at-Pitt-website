import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { useRef } from "react";
import { useHeroReady } from "@/hooks/use-hero-ready";
function Hero() { const root=useRef<HTMLDivElement>(null);const ready=useHeroReady(root,"initial");return <div ref={root} data-testid="hero" data-ready={ready}><img alt="" src="/photo.webp"/></div>; }
beforeEach(()=> {if (!HTMLImageElement.prototype.decode) Object.defineProperty(HTMLImageElement.prototype,"decode",{configurable:true,writable:true,value:()=>Promise.resolve()});vi.useFakeTimers();vi.stubGlobal("requestAnimationFrame",(fn:FrameRequestCallback)=>{fn(0);return 1;});vi.stubGlobal("cancelAnimationFrame",vi.fn());});
afterEach(()=> {vi.useRealTimers();vi.unstubAllGlobals();vi.restoreAllMocks();});
it("keeps the loading state until the real image has decoded",async()=> {
 let finish!:()=>void;vi.spyOn(HTMLImageElement.prototype,"decode").mockImplementation(()=>new Promise<void>(resolve=>{finish=resolve;}));
 const view=render(<Hero/>);expect(view.getByTestId("hero")).toHaveAttribute("data-ready","false");
 await act(async()=>{finish();});expect(view.getByTestId("hero")).toHaveAttribute("data-ready","true");
});
it("opens the page when an image fails",async()=> {
 vi.spyOn(HTMLImageElement.prototype,"decode").mockRejectedValue(Error("missing image"));const view=render(<Hero/>);
 await act(async()=>{});expect(view.getByTestId("hero")).toHaveAttribute("data-ready","true");
});
it("never traps a visitor behind a stalled image",async()=> {
 vi.spyOn(HTMLImageElement.prototype,"decode").mockImplementation(()=>new Promise(()=>{}));const view=render(<Hero/>);
 act(()=>{vi.advanceTimersByTime(2500);});expect(view.getByTestId("hero")).toHaveAttribute("data-ready","true");
});
