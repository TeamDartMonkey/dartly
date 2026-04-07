import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LogoutButton } from "@/components/dashboard/logout-button";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("LogoutButton", () => {
  //renders
  it("renders the logout button", () => {
    render(<LogoutButton />);
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });

  //happy path
  it("redirects to /login on successful logout", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    //this mocks window.location.href
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });

    render(<LogoutButton />);
    await userEvent.click(screen.getByRole("button", { name: /sign out/i }));
    expect(window.location.href).toBe("/login");
  });

  //fails
  it("shows error when logout fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Failed to log out." }),
    });

    render(<LogoutButton />);
    await userEvent.click(screen.getByRole("button", { name: /sign out/i }));
    expect(screen.getByText("Failed to log out.")).toBeInTheDocument();
  });
});
