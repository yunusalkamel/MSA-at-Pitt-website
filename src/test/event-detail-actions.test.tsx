import { render } from "@testing-library/react";
import { expect, it } from "vitest";
import EventDetailSheet from "@/components/events/EventDetailSheet";
import type { MSAEvent } from "@/data/events";
const base={id:"weekly",title:"Soccer",categories:["sports"],tags:[],location:"Pitt",timeLabel:"7 PM",shortBlurb:"",calendarFallbackUrl:"https://calendar.google.com/calendar",startDate:"2026-12-01"} as MSAEvent;
it("keeps registration and calendar links together in event details",()=> {
 const view=render(<EventDetailSheet event={{...base,rsvpUrl:"https://forms.gle/signup",addToCalendarUrl:"https://calendar.google.com/event"}} onClose={()=>{}}/>);
 expect(view.getByRole("link",{name:/RSVP/})).toHaveAttribute("href","https://forms.gle/signup");
 expect(view.getByRole("link",{name:/Add to Calendar/})).toHaveAttribute("href","https://calendar.google.com/event");
});
it("keeps a calendar action on past events and events without a supplied calendar URL",()=> {
 const view=render(<EventDetailSheet event={{...base,isPast:true}} onClose={()=>{}}/>);
 expect(view.getByRole("link",{name:/Add to Calendar/})).toHaveAttribute("href",base.calendarFallbackUrl);
});
it("offers Linktree while required registration is pending",()=> {
 const view=render(<EventDetailSheet event={{...base,description:"Registration required. Link coming soon."}} onClose={()=>{}}/>);
 expect(view.getByRole("link",{name:/Linktree/})).toHaveAttribute("href","https://linktr.ee/msa.at.pitt");
 expect(view.queryByRole("link",{name:/RSVP/})).toBeNull();
});
