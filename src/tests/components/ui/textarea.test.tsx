import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Textarea } from "@/components/ui/textarea";

describe("Textarea", () => {
  it("renders with label", () => {
    render(<Textarea id="test" label="Description" />);
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
  });

  it("shows error message when error prop is provided", () => {
    render(<Textarea id="test" label="Desc" error="Too short" />);
    expect(screen.getByText("Too short")).toBeInTheDocument();
  });
});
