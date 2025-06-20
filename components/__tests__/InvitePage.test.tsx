import '@testing-library/jest-dom';
import { render, screen, waitFor } from "@testing-library/react";
import InvitePage from "@/app/invite/page";
import * as api from "@/lib/apiClient";
import * as useUser from "@/hooks/useSupabaseUser";
import * as nextNavigation from "next/navigation";

// ───── mocks ────────────────────────────────────────────
jest.mock("@/hooks/useSupabaseUser", () => ({ useSupabaseUser: jest.fn() }));
jest.mock("@/lib/apiClient",          () => ({ apiPut: jest.fn()             }));
jest.mock("next/navigation", () => ({
  ...jest.requireActual("next/navigation"),
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

const sp = nextNavigation.useSearchParams as jest.Mock;

// ───── helpers ──────────────────────────────────────────
const setURLToken = (value: string | null) =>
  sp.mockImplementation(() => new URLSearchParams(value ? `?token=${value}` : ""));

// ───── tests ────────────────────────────────────────────
describe("InvitePage end-to-end cases", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("valid token renders <ValidInvitePage>", async () => {
    setURLToken("good123");
    (api.apiPut as jest.Mock).mockResolvedValue({ valid: true, email: "u@e.com" });
    (useUser.useSupabaseUser as jest.Mock).mockReturnValue(null);

    render(<InvitePage />);
    await waitFor(() =>
      expect(screen.getByText(/officially invited/i)).toBeInTheDocument()
    );
    expect(localStorage.getItem("gr_invite_token")).toBe("good123");
  });

  it("invalid token renders <InvalidInvitePage>", async () => {
    setURLToken("bad999");
    (api.apiPut as jest.Mock).mockResolvedValue({ valid: false });
    (useUser.useSupabaseUser as jest.Mock).mockReturnValue(null);

    render(<InvitePage />);
    await waitFor(() =>
      expect(screen.getByText(/invalid or has been revoked/i)).toBeInTheDocument()
    );
  });

  it("shows checking loader while request pending", () => {
    setURLToken("pending");
    (api.apiPut as jest.Mock).mockImplementation(() => new Promise(() => {}));
    (useUser.useSupabaseUser as jest.Mock).mockReturnValue(null);

    render(<InvitePage />);
    expect(screen.getByText(/verifying your invite token/i)).toBeInTheDocument();
  });

  it("logged-in user (no URL token) redirects home", async () => {
    setURLToken(null);
    (useUser.useSupabaseUser as jest.Mock).mockReturnValue("user@b.com");
    const push = jest.fn();
    const replace = jest.fn();
    (nextNavigation.useRouter as jest.Mock).mockReturnValue({ push, replace });

    render(<InvitePage />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
  });
});
