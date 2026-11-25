import {afterEach,beforeEach,expect,it,vi} from "vitest";
import handler from "../../api/site-editor.js";

const services=vi.hoisted(()=>({getUser:vi.fn(),create:vi.fn(),upload:vi.fn()}));
vi.mock("@supabase/supabase-js",()=>({createClient:()=>({auth:{getUser:services.getUser}})}));
vi.mock("@sanity/client",()=>({createClient:()=>({create:services.create,assets:{upload:services.upload}})}));
function call(body:object, token="test"){
  const res={statusCode:200,setHeader:vi.fn(),json:vi.fn(),end:vi.fn(),status(code:number){this.statusCode=code;return this;}};
  return handler({method:"POST",body,headers:{authorization:token?"Bearer "+token:""}},res).then(()=>res);
}
beforeEach(()=>{
  vi.clearAllMocks();vi.stubEnv("SANITY_EDITOR_TOKEN","test");
  vi.stubEnv("SANITY_EDITOR_DATASET","test");vi.stubEnv("VERCEL_ENV","preview");
  services.getUser.mockResolvedValue({data:{user:{email:"yunusaalkamel@gmail.com",email_confirmed_at:"2026-01-01"}},error:null});
});
afterEach(()=>vi.unstubAllEnvs());
it("requires verified owner credentials for publishing and uploads",async()=>{
  expect((await call({action:"publish"},"")).statusCode).toBe(401);
  services.getUser.mockResolvedValue({data:{user:{email:"someone@example.com",email_confirmed_at:"today"}}});
  for(const action of ["publish","image"])expect((await call({action})).statusCode).toBe(403);
  expect(services.create).not.toHaveBeenCalled();expect(services.upload).not.toHaveBeenCalled();
});
it("protects production from previews and preserves edits on conflict",async()=>{
  vi.stubEnv("SANITY_EDITOR_DATASET","production");
  const body={action:"publish",revision:null,fields:{title:{kind:"text",runs:[{text:"Updated",bold:true}]}}};
  expect((await call(body)).statusCode).toBe(503);
  vi.stubEnv("SANITY_EDITOR_DATASET","test");services.create.mockRejectedValue({statusCode:409});
  expect((await call(body)).statusCode).toBe(409);
});
