import { beforeEach, afterEach, expect, it, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Admin from "@/editor/Admin";
import { CardCopies, TextField } from "@/editor/content";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange(callback: Function) {
        callback("SIGNED_IN", { access_token: "test", user: { id: "owner" } });
        return { data: { subscription: { unsubscribe() {} } } };
      },
    },
  },
}));
let published: Record<string, unknown> = {};
beforeEach(() => {
  published = {};
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, options?: RequestInit) => {
      const body = JSON.parse(String(options?.body || "{}"));
      if (body.action === "publish") {
        published = body.fields;
        return Response.json({ revision: "b" });
      }
      if (body.action === "session") return Response.json({ authorized: true });
      return Response.json({ revision: "a", fields: {} });
    }),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("publishes an independently editable duplicate at the selected position", async () => {
  render(
    <MemoryRouter>
      <Admin>
        <CardCopies id="room">
          <div>
            <TextField id="title">Prayer room</TextField>
          </div>
        </CardCopies>
      </Admin>
    </MemoryRouter>,
  );
  await waitFor(() =>
    expect(
      screen.getByText("Prayer room").closest("[data-edit-text]"),
    ).toBeTruthy(),
  );
  fireEvent.click(screen.getByText("Prayer room"));
  fireEvent.click(
    await screen.findByRole("button", { name: "Duplicate card" }),
  );
  const copies = screen.getAllByText("Prayer room");
  expect(copies).toHaveLength(2);
  fireEvent.click(copies[1]);
  const editable = screen.getByRole("textbox");
  editable.textContent = "New prayer room";
  fireEvent.blur(editable);
  fireEvent.click(screen.getByRole("button", { name: "Publish" }));
  await screen.findByText("Published.");
  expect(Object.values(published)).toContainEqual({
    kind: "text",
    runs: [{ text: "New prayer room" }],
  });
  expect(screen.getAllByText("Prayer room")).toHaveLength(1);
});
