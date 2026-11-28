import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { resolveEventAction, attendanceInfo } from "@/components/events/resolveEventAction";
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
  it("recognizes unlabeled form destinations without promoting generic links",()=> {
    expect(parseDescription('https://forms.gle/example',"").rsvpUrl).toBe('https://forms.gle/example');
    expect(parseDescription('Link: https://example.org/details',"").rsvpUrl).toBeUndefined();
    expect(parseDescription('Registration required. Details: https://example.org/details',"").rsvpUrl).toBeUndefined();
    expect(parseDescription('RSVP: https://linktr.ee/msa.at.pitt',"").rsvpUrl).toBeUndefined();
  });
  it("distinguishes open programs from a required but pending registration",()=> {
    expect(attendanceInfo({...event,rsvpUrl:undefined,title:"Soccer",categories:["sports"]})).toBe("open");
    expect(attendanceInfo({...event,rsvpUrl:undefined,description:"Registration required. Link coming soon."})).toBe("pending");
    expect(attendanceInfo(event)).toBeUndefined();
    expect(attendanceInfo({...event,rsvpUrl:undefined,title:"Paintball",categories:["sports"]})).toBeUndefined();
  });

  it("rechecks cached descriptions so stale generic links cannot become signup buttons",()=> {
    expect(resolveEventAction({...event,description:"Link: https://example.org/details"}).kind).toBe("details");
    expect(resolveEventAction({...event,rsvpUrl:undefined,description:"https://forms.gle/example"}).kind).toBe("signup");
    expect(attendanceInfo({...event,rsvpUrl:undefined,description:"https://forms.gle/example"})).toBeUndefined();
  });

});
