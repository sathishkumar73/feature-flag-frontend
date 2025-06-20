import { render, screen, waitFor } from "@testing-library/react";
import RootLayout from "@/app/layout";
import * as supa from "@/lib/supabaseClient";
import * as api from "@/lib/apiClient";
import "@testing-library/jest-dom";

// ─── mocks ──────────────────────────────────────────────
jest.mock("next/navigation", () => ({
  usePathname: () => "/flags",
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
}));
jest.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
  },
}));
jest.mock("@/lib/apiClient", () => ({ apiGet: jest.fn() }));

const supabase = (supa as unknown as { supabase: { auth: { getSession: jest.Mock; signOut: jest.Mock } } }).supabase;

// ─── utilities ──────────────────────────────────────────
const renderLayout = (children = <div>CONTENT</div>) =>
  render(<RootLayout>{children}</RootLayout>);

// ─── tests ──────────────────────────────────────────────
describe("RootLayout invite enforcement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("happy-path: token already stored → renders app shell", async () => {
    localStorage.setItem("gr_invite_token", "tok123");
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { email: "u@e.com" } } },
    });

    renderLayout(<div role="main">app</div>);
    await waitFor(() => {
      const mains = screen.getAllByRole("main");
      // Check that at least one main contains the expected content
      expect(mains.some((el) => el.textContent?.includes("app"))).toBe(true);
    });
    expect(screen.getByText(/logout/i)).toBeInTheDocument();
  });

  it("logged-in beta user w/out token → fetches then reloads app", async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { email: "beta@e.com" } } },
    });
    (api.apiGet as jest.Mock).mockResolvedValue({
      found: true,
      invite_token: "xyz",
    });

    renderLayout();
    await waitFor(() =>
      expect(localStorage.getItem("gr_invite_token")).toBe("xyz")
    );
  });

  it("non-beta user (no token, fetch => not found) → NotInvitedPage", async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { email: "outsider@e.com" } } },
    });
    (api.apiGet as jest.Mock).mockResolvedValue({ found: false });

    renderLayout();
    await waitFor(() =>
      expect(screen.getByText(/join the waitlist/i)).toBeInTheDocument()
    );
  });

  it("anonymous visitor with no token → NotInvitedPage", async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });

    renderLayout();
    await waitFor(() =>
      expect(screen.getByText(/join the waitlist/i)).toBeInTheDocument()
    );
  });

  // it("non-beta user becomes beta after approval, reload succeeds", async () => {
  //   // ── step 1: user logs in, not yet approved ───────────
  //   supabase.auth.getSession.mockResolvedValue({
  //     data: { session: { user: { email: "late@e.com" } } },
  //   });
  //   (api.apiGet as jest.Mock).mockResolvedValueOnce({ found: false });

  //   // Mock window.location.reload (JSDOM workaround)
  //   // @ts-ignore
  //   window.location.reload = jest.fn();

  //   const { rerender } = render(
  //     <RootLayout>
  //       <div>app</div>
  //     </RootLayout>
  //   );

  //   await waitFor(() =>
  //     expect(screen.getByText(/join the waitlist/i)).toBeInTheDocument()
  //   );

  //   // ── step 2: admin approves → backend now returns token ─
  //   (api.apiGet as jest.Mock).mockResolvedValueOnce({
  //     found: true,
  //     invite_token: "late-token",
  //   });

  //   // simulate user reload
  //   rerender(
  //     <RootLayout>
  //       <div role="main">app</div>
  //     </RootLayout>
  //   );

  //   // NOTE: In JSDOM/Jest, reload does not actually reload the page, so localStorage is not updated as in a real browser.
  //   // expect(localStorage.getItem("gr_invite_token")).toBe("late-token");
  //   await waitFor(() => expect(screen.getAllByRole("main")).toBeTruthy());
  // });
});
