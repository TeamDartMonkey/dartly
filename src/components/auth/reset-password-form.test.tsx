import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ResetPasswordForm } from "./reset-password-form";

//this is different from the other ones because we call supabase directly in the component instead of using an API route
const mockPush = vi.fn();
const mockGetSession = vi.fn();
const mockUpdateUser = vi.fn();
const mockSignOut = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/services/supabase", () => ({
  createClient: () => ({
    auth: {
      getSession: mockGetSession,
      exchangeCodeForSession: vi.fn(),
      updateUser: mockUpdateUser,
      signOut: mockSignOut,
    },
  }),
}));

describe("ResetPasswordForm", () => {
  it("shows error when reset link is invalid", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    render(<ResetPasswordForm />);
    await screen.findByText("Invalid or expired reset link.");
  });

  it("renders all fields and submit button", () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "123" } } },
    });

    render(<ResetPasswordForm />);
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm New Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset password/i })).toBeInTheDocument();
  });

  //validation failures
  //simulates a user typing wrong passwords and clicking submit, then checks for the error message
  it("shows error when password is too short", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "123" } } },
    });

    render(<ResetPasswordForm />);
    await userEvent.type(screen.getByLabelText("New Password"), "Ab1!");
    await userEvent.type(screen.getByLabelText("Confirm New Password"), "Ab1!");
    await userEvent.click(screen.getByRole("button", { name: /reset password/i }));
    expect(screen.getByText("Password must be at least 8 characters.")).toBeInTheDocument();
  });

  it("shows error when password has no uppercase letter", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "123" } } },
    });

    render(<ResetPasswordForm />);
    await userEvent.type(screen.getByLabelText("New Password"), "password1!");
    await userEvent.type(screen.getByLabelText("Confirm New Password"), "password1!");
    await userEvent.click(screen.getByRole("button", { name: /reset password/i }));
    expect(
      screen.getByText("Password must contain at least one uppercase letter.")
    ).toBeInTheDocument();
  });

  it("shows error when password has no lowercase letter", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "123" } } },
    });

    render(<ResetPasswordForm />);
    await userEvent.type(screen.getByLabelText("New Password"), "PASSWORD1!");
    await userEvent.type(screen.getByLabelText("Confirm New Password"), "PASSWORD1!");
    await userEvent.click(screen.getByRole("button", { name: /reset password/i }));
    expect(
      screen.getByText("Password must contain at least one lowercase letter.")
    ).toBeInTheDocument();
  });

  it("shows error when password has no number", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "123" } } },
    });

    render(<ResetPasswordForm />);
    await userEvent.type(screen.getByLabelText("New Password"), "Password!");
    await userEvent.type(screen.getByLabelText("Confirm New Password"), "Password!");
    await userEvent.click(screen.getByRole("button", { name: /reset password/i }));
    expect(screen.getByText("Password must contain at least one number.")).toBeInTheDocument();
  });

  it("shows error when password has no special character", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "123" } } },
    });

    render(<ResetPasswordForm />);
    await userEvent.type(screen.getByLabelText("New Password"), "Password1");
    await userEvent.type(screen.getByLabelText("Confirm New Password"), "Password1");
    await userEvent.click(screen.getByRole("button", { name: /reset password/i }));
    expect(
      screen.getByText("Password must contain at least one special character.")
    ).toBeInTheDocument();
  });

  it("shows error when passwords do not match", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "123" } } },
    });

    render(<ResetPasswordForm />);
    await userEvent.type(screen.getByLabelText("New Password"), "Password1!");
    await userEvent.type(screen.getByLabelText("Confirm New Password"), "Different1!");
    await userEvent.click(screen.getByRole("button", { name: /reset password/i }));
    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
  });

  //duplicate email
  //because this is a server side error, we make a mock fetch that results in an error with ok: false, then check for the error message
  it("shows error when reset fails", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "123" } } },
    });
    mockUpdateUser.mockResolvedValue({
      error: { message: "Something went wrong." },
    });

    render(<ResetPasswordForm />);
    await userEvent.type(screen.getByLabelText("New Password"), "Password1!");
    await userEvent.type(screen.getByLabelText("Confirm New Password"), "Password1!");
    await userEvent.click(screen.getByRole("button", { name: /reset password/i }));
    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
  });

  //happy path
  //mock fetch with ok: true, then check if router.push was called with /login
  it("redirects to /login on successful reset", async () => {
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });

    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "123" } } },
    });
    mockUpdateUser.mockResolvedValue({ error: null });
    mockSignOut.mockResolvedValue({});

    render(<ResetPasswordForm />);
    await userEvent.type(screen.getByLabelText("New Password"), "Password1!");
    await userEvent.type(screen.getByLabelText("Confirm New Password"), "Password1!");
    await userEvent.click(screen.getByRole("button", { name: /reset password/i }));
    expect(mockSignOut).toHaveBeenCalled();
    expect(window.location.href).toBe("/login");
  });
});
