import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

//this is different from the other ones because we call supabase directly in the component instead of using an API route
const mockResetPasswordForEmail = vi.fn();

vi.mock("@/services/supabase", () => ({
  createClient: () => ({
    auth: {
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
  }),
}));

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
  });

  //happy path
  it("shows success message on successful submission", async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });

    render(<ForgotPasswordForm />);
    await userEvent.type(screen.getByLabelText("Email"), "test@test.com");
    await userEvent.click(screen.getByRole("button", { name: /send reset link/i }));
    expect(screen.getByText(/a password reset link has been sent/i)).toBeInTheDocument();
  });

  it("shows error when server returns an error", async () => {
    mockResetPasswordForEmail.mockResolvedValue({
      error: { message: "Something went wrong." },
    });

    render(<ForgotPasswordForm />);
    await userEvent.type(screen.getByLabelText("Email"), "test@test.com");
    await userEvent.click(screen.getByRole("button", { name: /send reset link/i }));
    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
  });
});
