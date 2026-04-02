import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "./login-form";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("LoginForm", () => {
  // Rendering
  it("renders all fields", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("renders the submit button", () => {
    render(<LoginForm />);
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  //validation failures
  //
  it("shows error when email is invalid", async () => {
    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText("Email"), "invalid-email");
    await userEvent.type(screen.getByLabelText("Password"), "Ab1!");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));
    expect(screen.getByText("Please enter a valid email address.")).toBeInTheDocument();
  });

  it("shows error when password is empty", async () => {
    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText("Email"), "test@test.com");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));
    expect(screen.getByText("Password is required.")).toBeInTheDocument();
  });

  //invalid credentials
  it("shows error when credentials are invalid", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Invalid email or password." }),
    });

    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText("Email"), "test@test.com");
    await userEvent.type(screen.getByLabelText("Password"), "wrongpassword");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));
    expect(screen.getByText("Invalid email or password.")).toBeInTheDocument();
  });

  //happy path
  //mock fetch with ok: true, then check if router.push was called with /profile
  it("redirects to /profile on successful registration", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText("Email"), "test@test.com");
    await userEvent.type(screen.getByLabelText("Password"), "Password1!");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });
});
