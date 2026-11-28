import { afterEach, expect, it, vi } from "vitest";
import handler from "../../api/calendar.js";
const services=vi.hoisted(()=>({access:vi.fn(),management:vi.fn()}));
vi.mock("../../server/management.js",()=>({management:services.management}));
afterEach(()=>vi.unstubAllGlobals());
function response() {return {code:200,setHeader:vi.fn(),end:vi.fn(),json:vi.fn(),status(value:number){this.code=value;return this;}};}
it("rejects preview requests before contacting the live sync",async()=> {
 services.management.mockResolvedValue(services.access);services.access.mockResolvedValue({environment:"preview"});
 const fetch=vi.fn();vi.stubGlobal("fetch",fetch);const res=response();await handler({method:"POST",headers:{}},res);
 expect(res.code).toBe(403);expect(fetch).not.toHaveBeenCalled();
});
it("preserves authorization failures without contacting the live sync",async()=> {
 services.management.mockRejectedValue(Object.assign(Error("Sign in"),{publicStatus:401}));
 const fetch=vi.fn();vi.stubGlobal("fetch",fetch);const res=response();await handler({method:"POST",headers:{}},res);
 expect(res.code).toBe(401);expect(fetch).not.toHaveBeenCalled();
});
it("forwards an authenticated production refresh to only the configured project",async()=> {
 services.management.mockResolvedValue(services.access);services.access.mockResolvedValue({environment:"production"});
 vi.stubGlobal("AbortSignal",{timeout:()=>new AbortController().signal});
 const fetch=vi.fn().mockResolvedValue(Response.json({synced:true,count:725}));vi.stubGlobal("fetch",fetch);
 const res=response();await handler({method:"POST",headers:{authorization:"Bearer signed-in-user"}},res);
 expect(fetch.mock.calls[0][0]).toBe("https://hvoiytjyimcyvpamsbay.supabase.co/functions/v1/sync-calendar");
 expect(res.json).toHaveBeenCalledWith({synced:true,count:725});
});
