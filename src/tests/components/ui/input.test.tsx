import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("renders with label", () => {
    render(<Input id="test" label="First Name" />);
    expect(screen.getByLabelText("First Name")).toBeInTheDocument();
  });

  it("shows error message when error prop is provided", () => {
    render(<Input id="test" label="Name" error="Required" />);
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("applies error border style when error prop is provided", () => {
    render(<Input id="test" label="Name" error="Required" />);
    const input = screen.getByLabelText("Name");
    expect(input.className).toContain("border-red-500");
  });

  it("renders without label when not provided", () => {
    render(<Input id="test" />);
    expect(document.getElementById("test")).toBeInTheDocument();
  });
});
