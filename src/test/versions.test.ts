import {expect,it,vi} from "vitest";
import {versions} from "../../server/versions.js";
it("records encrypted versions atomically, restores a field and preserves both earlier states",async()=>{
 vi.stubEnv("MSA_MANAGEMENT_KEY","test");
 const docs=new Map();let rev=0;
 const client={getDocument:async id=>docs.get(id),getDocuments:async ids=>ids.map(id=>docs.get(id)),transaction(){
 const writes=[];return {create(doc){writes.push(doc);return this;},patch(id,apply){apply({ifRevisionId(expected){expect(docs.get(id)._rev).toBe(expected);return this;},set(value){writes.push({_id:id,...value});}});return this;},async commit(){return writes.map(doc=>{const next={...doc,_rev:String(++rev)};docs.set(doc._id,next);return next;});}};}};
 const act=body=>versions(client,body,"owner@example.org","preview");
 const first=await act({action:"publish",revision:null,fields:{a:1,b:2}});
 const second=await act({action:"publish",revision:first.revision,fields:{a:3,b:4}});
 await expect(act({action:"restore",revision:first.revision,id:first.id})).rejects.toThrow(/changed/);
 const restored=await act({action:"restore",revision:second.revision,id:first.id,field:"a"});
 expect((await act({action:"version",id:restored.id})).after).toEqual({a:1,b:4});
 expect((await act({action:"version",id:second.id})).after).toEqual({a:3,b:4});
 expect(JSON.stringify([...docs.values()])).not.toContain("owner@example.org");
 vi.unstubAllEnvs();
});
