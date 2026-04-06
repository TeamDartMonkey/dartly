import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CompletionIndicator } from "@/components/ui/completion-indicator";

const items = [
  { label: "First name", complete: true },
  { label: "Last name", complete: false },
  { label: "Email", complete: true },
];

describe("CompletionIndicator", () => {
  it("shows fraction label", () => {
    render(<CompletionIndicator items={items} totalLabel="2 of 3 complete" />);
    expect(screen.getByText("2 of 3 complete")).toBeInTheDocument();
  });

  it("shows percentage", () => {
    render(<CompletionIndicator items={items} totalLabel="2 of 3 complete" />);
    expect(screen.getByText("67%")).toBeInTheDocument();
  });

  it("expands checklist on click", async () => {
    const user = userEvent.setup();
    render(<CompletionIndicator items={items} totalLabel="2 of 3 complete" />);
    expect(screen.queryByText("First name")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button"));
    expect(screen.getByText("First name")).toBeInTheDocument();
  });

  it("shows green check for complete items", async () => {
    const user = userEvent.setup();
    render(<CompletionIndicator items={items} totalLabel="2 of 3 complete" />);
    await user.click(screen.getByRole("button"));
    const firstName = screen.getByText("First name").closest("div");
    expect(firstName?.querySelector("svg")).toBeInTheDocument();
  });
});
