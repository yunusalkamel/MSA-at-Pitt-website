import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import ManagementLogin from "@/editor/ManagementLogin";

const google = vi.hoisted(() => vi.fn());
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: {
    onAuthStateChange: (callback) => {
      callback("INITIAL_SESSION", null);
      return {data: {subscription: {unsubscribe: () => {}}}};
    },
    signInWithOAuth: google,
  }},
}));
afterEach(() => {cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks();});
it.each([true, false])("returns Google users to their management route (owner=%s)", async owner => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ok:true,json:async()=>({external:{google:true}})}));
  google.mockResolvedValue({error:null});
  render(<ManagementLogin owner={owner}>{()=>"Private content"}</ManagementLogin>);
  fireEvent.click(await screen.findByRole("button",{name:"Continue with Google"}));
  await waitFor(()=>expect(google).toHaveBeenCalledWith(expect.objectContaining({
    provider:"google", options:expect.objectContaining({redirectTo:location.origin+(owner?"/owner":"/admin")})
  })));
});
it("explains missing provider setup before redirecting",async()=>{
  vi.stubGlobal("fetch",vi.fn().mockResolvedValue({ok:true,json:async()=>({external:{google:false}})}));
  render(<ManagementLogin owner>{()=>"Private content"}</ManagementLogin>);
  fireEvent.click(await screen.findByRole("button",{name:"Continue with Google"}));
  expect(await screen.findByText(/needs to be enabled/)).toBeTruthy();
  expect(google).not.toHaveBeenCalled();
});
