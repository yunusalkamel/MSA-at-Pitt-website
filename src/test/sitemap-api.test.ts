import { afterEach, expect, it, vi } from "vitest";
import handler from "../../api/sitemap.js";
const service=vi.hoisted(()=>({getDocument:vi.fn(),fetch:vi.fn()}));
vi.mock("@sanity/client",()=>({createClient:()=>service}));
afterEach(()=>{vi.unstubAllEnvs();vi.resetAllMocks();});
function response(){return {code:200,setHeader:vi.fn(),send:vi.fn(),end:vi.fn(),status(code:number){this.code=code;return this;}};}
it("serves XML even when published metadata is temporarily unavailable",async()=> {
 vi.stubEnv("VERCEL_ENV","production");vi.stubEnv("SANITY_EDITOR_DATASET","production");vi.stubEnv("SITE_ORIGIN","https://msaatpitt.org");service.getDocument.mockRejectedValue(Error("offline"));service.fetch.mockRejectedValue(Error("offline"));
 const res=response();await handler({method:"GET"},res);expect(res.code).toBe(200);expect(res.setHeader).toHaveBeenCalledWith("Content-Type","application/xml; charset=utf-8");expect(res.send.mock.calls[0][0]).toContain("https://msaatpitt.org/resources/prayer</loc>");
});
it("does not expose a production sitemap from a preview deployment",async()=> {
 vi.stubEnv("VERCEL_ENV","preview");const res=response();await handler({method:"GET"},res);expect(res.code).toBe(404);expect(service.fetch).not.toHaveBeenCalled();expect(res.setHeader).toHaveBeenCalledWith("X-Robots-Tag","noindex, nofollow");
});
it("discovers published CMS pages without leaking drafts",async()=> {
 vi.stubEnv("VERCEL_ENV","production");vi.stubEnv("SANITY_EDITOR_DATASET","production");service.getDocument.mockResolvedValue({fieldsJson:JSON.stringify({live:{kind:"page",path:"/join-us",visibility:"published"},draft:{kind:"page",path:"/private-campaign",visibility:"draft"}})});service.fetch.mockResolvedValue([{slug:"community-dinner"}]);
 const res=response();await handler({method:"GET"},res);const xml=res.send.mock.calls[0][0];expect(xml).toContain("/join-us</loc>");expect(xml).toContain("/gallery/community-dinner</loc>");expect(xml).not.toContain("private-campaign");
});
