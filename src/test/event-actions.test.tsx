import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { resolveEventAction } from "@/components/events/resolveEventAction";
import { linkifyText } from "@/lib/linkify";
import { parseDescription } from "../../supabase/functions/google-calendar-events/parse-description";
import type { MSAEvent } from "@/data/events";
const event = {id:"weekly halaqa",categories:["halaqa"],rsvpUrl:"https://forms.gle/signup",clickUrl:"https://calendar.google.com/calendar",tags:[]} as MSAEvent;
describe("calendar event actions",()=> {
  it("shows registration for recurring events when a registration link exists",()=> {
    expect(resolveEventAction(event)).toMatchObject({kind:"signup",href:event.rsvpUrl});
  });
  it("opens that event's details when no signup link is supplied",()=> {
    expect(resolveEventAction({...event,rsvpUrl:undefined})).toMatchObject({kind:"details",href:"/events?event=weekly%20halaqa",external:false});
  });
  it("extracts signup links from calendar HTML without treating general links as RSVP",()=> {
    expect(parseDescription('<a href="https://forms.gle/signup?a=1&amp;b=2">Register</a>',"").rsvpUrl).toBe("https://forms.gle/signup?a=1&b=2");
    expect(parseDescription('Link: https://example.org/location',"").rsvpUrl).toBeUndefined();
    expect(parseDescription('No RSVP required. https://example.org/location',"").rsvpUrl).toBeUndefined();
  });
  it("preserves all description copy and links without rendering unsafe HTML",()=> {
    const view=render(<div>{linkifyText('Meet at 7. <a href="https://example.org/one">Details</a> and <a href="https://example.org/two">Directions</a><script>alert(1)</script><a href="javascript:alert(1)">unsafe</a>')}</div>);
    expect(view.container).toHaveTextContent("Meet at 7. Details and Directions");
    expect(view.getAllByRole("link")).toHaveLength(2);
    expect(view.container.querySelector("script")).toBeNull();
  });
});
