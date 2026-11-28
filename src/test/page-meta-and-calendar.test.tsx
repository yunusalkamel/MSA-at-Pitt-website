import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it } from "vitest";
import { usePageMeta } from "@/lib/usePageMeta";
import { Content, LinkField } from "@/editor/content";
import { LINKS } from "@/config/links";
import { SITE_NAME } from "../../shared/brand.js";
function Page({title}:{title:string}) { usePageMeta({title}); return null; }
it("sets the current page title but keeps shared-link branding exact",()=> {
 const first=render(<MemoryRouter><Page title="Events"/></MemoryRouter>);first.unmount();
 const second=render(<MemoryRouter><Page title={`Prayer at Pitt | ${SITE_NAME}`}/></MemoryRouter>);
 expect(document.title).toBe(`Prayer at Pitt | ${SITE_NAME}`);
 expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute("content",SITE_NAME);
 expect(document.querySelector('meta[name="twitter:title"]')).toHaveAttribute("content",SITE_NAME);
 second.unmount();expect(document.title).toBe(SITE_NAME);
});
it("uses the configured Apple feed even if a legacy editor override is present",()=> {
 const view=render(<MemoryRouter><Content.Provider value={{editing:true,fields:{"//apple":{kind:"link",url:"https://experience.pitt.edu/msa/apple-calendar/"}}}}><LinkField fieldId="apple" fixedDestination href={LINKS.appleCalendarSubscribe}>Apple Calendar</LinkField></Content.Provider></MemoryRouter>);
 expect(view.getByRole("link")).toHaveAttribute("href","webcal://calendar.google.com/calendar/ical/2use05cacfd5hu3q2p49q9dvmc%40group.calendar.google.com/public/basic.ics");
 expect(view.getByRole("link")).not.toHaveAttribute("data-edit-link");
});
