import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RegisterForm } from "@/components/auth/register-form";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("RegisterForm", () => {
  // Rendering
  it("renders all fields", () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/)).toBeInTheDocument();
  });

  it("renders the submit button", () => {
    render(<RegisterForm />);
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });

  //validation failures
  //simulates a user typing wrong passwords and clicking submit, then checks for the error message
  it("shows error when password is too short", async () => {
    render(<RegisterForm />);
    await userEvent.type(screen.getByLabelText(/Email/), "test@test.com");
    await userEvent.type(screen.getByLabelText(/^Password/), "Ab1!");
    await userEvent.type(screen.getByLabelText(/Confirm Password/), "Ab1!");
    await userEvent.click(screen.getByRole("button", { name: /register/i }));
    expect(screen.getByText("Password must be at least 8 characters.")).toBeInTheDocument();
  });

  it("shows error when password has no uppercase letter", async () => {
    render(<RegisterForm />);
    await userEvent.type(screen.getByLabelText(/Email/), "test@test.com");
    await userEvent.type(screen.getByLabelText(/^Password/), "password1!");
    await userEvent.type(screen.getByLabelText(/Confirm Password/), "password1!");
    await userEvent.click(screen.getByRole("button", { name: /register/i }));
    expect(
      screen.getByText("Password must contain at least one uppercase letter.")
    ).toBeInTheDocument();
  });

  it("shows error when password has no lowercase letter", async () => {
    render(<RegisterForm />);
    await userEvent.type(screen.getByLabelText(/Email/), "test@test.com");
    await userEvent.type(screen.getByLabelText(/^Password/), "PASSWORD1!");
    await userEvent.type(screen.getByLabelText(/Confirm Password/), "PASSWORD1!");
    await userEvent.click(screen.getByRole("button", { name: /register/i }));
    expect(
      screen.getByText("Password must contain at least one lowercase letter.")
    ).toBeInTheDocument();
  });

  it("shows error when password has no number", async () => {
    render(<RegisterForm />);
    await userEvent.type(screen.getByLabelText(/Email/), "test@test.com");
    await userEvent.type(screen.getByLabelText(/^Password/), "Password!");
    await userEvent.type(screen.getByLabelText(/Confirm Password/), "Password!");
    await userEvent.click(screen.getByRole("button", { name: /register/i }));
    expect(screen.getByText("Password must contain at least one number.")).toBeInTheDocument();
  });

  it("shows error when password has no special character", async () => {
    render(<RegisterForm />);
    await userEvent.type(screen.getByLabelText(/Email/), "test@test.com");
    await userEvent.type(screen.getByLabelText(/^Password/), "Password1");
    await userEvent.type(screen.getByLabelText(/Confirm Password/), "Password1");
    await userEvent.click(screen.getByRole("button", { name: /register/i }));
    expect(
      screen.getByText("Password must contain at least one special character.")
    ).toBeInTheDocument();
  });

  it("shows error when passwords do not match", async () => {
    render(<RegisterForm />);
    await userEvent.type(screen.getByLabelText(/Email/), "test@test.com");
    await userEvent.type(screen.getByLabelText(/^Password/), "Password1!");
    await userEvent.type(screen.getByLabelText(/Confirm Password/), "Different1!");
    await userEvent.click(screen.getByRole("button", { name: /register/i }));
    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
  });

  //duplicate email
  //because this is a server side error, we make a mock fetch that results in an error with ok: false, then check for the error message
  it("shows error when email is already registered", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "An account with this email already exists." }),
    });

    render(<RegisterForm />);
    await userEvent.type(screen.getByLabelText(/Email/), "existing@test.com");
    await userEvent.type(screen.getByLabelText(/^Password/), "Password1!");
    await userEvent.type(screen.getByLabelText(/Confirm Password/), "Password1!");
    await userEvent.click(screen.getByRole("button", { name: /register/i }));
    expect(screen.getByText("An account with this email already exists.")).toBeInTheDocument();
  });

  //happy path
  //mock fetch with ok: true, then check if router.push was called with /profile
  it("redirects to /profile on successful registration", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<RegisterForm />);
    await userEvent.type(screen.getByLabelText(/Email/), "new@test.com");
    await userEvent.type(screen.getByLabelText(/^Password/), "Password1!");
    await userEvent.type(screen.getByLabelText(/Confirm Password/), "Password1!");
    await userEvent.click(screen.getByRole("button", { name: /register/i }));
    expect(mockPush).toHaveBeenCalledWith("/profile");
  });
});
