import { expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import type { Session } from "@supabase/supabase-js";
import { ActivityChanges } from "@/editor/History";
import { request } from "@/editor/ManagementLogin";

vi.mock("@/editor/ManagementLogin", () => ({request:vi.fn(),messageOf:String}));
it("loads a publication comparison only when expanded and keeps it read-only",async()=>{
 const session={access_token:"test"} as Session;
 vi.mocked(request).mockResolvedValue({action:"publish",count:1,pages:["/join"],before:{button:{kind:"link",url:"https://example.org/old"}},after:{button:{kind:"link",url:"https://example.org/new"}}});
 render(<ActivityChanges session={session} id="version-id"/>);
 expect(request).not.toHaveBeenCalled();
 fireEvent.click(screen.getByRole("button",{name:"View changes"}));
 await screen.findByText("1 field · /join");
 fireEvent.click(screen.getByText("button"));
 expect(screen.getByText("https://example.org/old")).toBeVisible();
 expect(screen.getByText("https://example.org/new")).toBeVisible();
 expect(screen.queryByRole("button",{name:"Restore field"})).toBeNull();
 fireEvent.click(screen.getByRole("button",{name:"Hide changes"}));
 fireEvent.click(screen.getByRole("button",{name:"View changes"}));
 expect(request).toHaveBeenCalledTimes(1);
 cleanup();
});
