import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DatePicker } from "@/components/ui/date-picker";

describe("DatePicker", () => {
  it("renders with label", () => {
    render(<DatePicker id="start" label="Start Date" value="" onChange={() => {}} />);
    expect(screen.getByText("Start Date")).toBeInTheDocument();
  });

  it("shows placeholder when no value", () => {
    render(
      <DatePicker id="start" label="Start" value="" onChange={() => {}} placeholder="Pick a date" />
    );
    expect(screen.getByText("Pick a date")).toBeInTheDocument();
  });

  it("shows formatted date when value is provided", () => {
    render(<DatePicker id="start" label="Start" value="2024-03-15" onChange={() => {}} />);
    expect(screen.getByText("Mar 2024")).toBeInTheDocument();
  });

  it("opens a calendar grid when clicked", async () => {
    const user = userEvent.setup();
    render(<DatePicker id="start" label="Start" value="" onChange={() => {}} />);
    const trigger = screen.getByRole("button", {
      name: /select date/i,
    });
    await user.click(trigger);
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("shows error message when error prop is provided", () => {
    render(<DatePicker id="start" label="Start" value="" onChange={() => {}} error="Required" />);
    expect(screen.getByText("Required")).toBeInTheDocument();
  });
});
