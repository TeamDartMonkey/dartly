import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

// The form posts to /api/auth/reset-password rather than calling Supabase
// directly so the server can rate-limit and respond uniformly (account-
// enumeration defense).
const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ForgotPasswordForm", () => {
  it("renders email field and submit button", () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument();
  });

  it("shows error when email is invalid", async () => {
    render(<ForgotPasswordForm />);
    await userEvent.type(screen.getByLabelText("Email"), "invalid-email");
    await userEvent.click(screen.getByRole("button", { name: /send reset link/i }));
    expect(screen.getByText("Please enter a valid email address.")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows success message on a 2xx response", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ message: "If that account exists, a reset email was sent." }),
    });

    render(<ForgotPasswordForm />);
    await userEvent.type(screen.getByLabelText("Email"), "test@test.com");
    await userEvent.click(screen.getByRole("button", { name: /send reset link/i }));
    await waitFor(() =>
      expect(screen.getByText(/a password reset link has been sent/i)).toBeInTheDocument()
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/reset-password",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "test@test.com" }),
      })
    );
  });

  it("shows a friendly error on 429", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: "Too many requests" }),
    });

    render(<ForgotPasswordForm />);
    await userEvent.type(screen.getByLabelText("Email"), "test@test.com");
    await userEvent.click(screen.getByRole("button", { name: /send reset link/i }));
    await waitFor(() => expect(screen.getByText(/too many requests/i)).toBeInTheDocument());
  });

  it("shows a generic error on other non-ok responses", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: "Bad input" }),
    });

    render(<ForgotPasswordForm />);
    await userEvent.type(screen.getByLabelText("Email"), "test@test.com");
    await userEvent.click(screen.getByRole("button", { name: /send reset link/i }));
    await waitFor(() => expect(screen.getByText("Bad input")).toBeInTheDocument());
  });
});
