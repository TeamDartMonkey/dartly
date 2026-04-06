import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "@/components/ui/modal";

describe("Modal", () => {
  it("renders children when open", () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <Modal open={false} onClose={() => {}}>
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.queryByText("Modal content")).not.toBeInTheDocument();
  });

  it("calls onClose when clicking the backdrop", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal open={true} onClose={onClose}>
        <p>Content</p>
      </Modal>
    );
    // biome-ignore lint/style/noNonNullAssertion: test-only, element guaranteed to exist
    const backdrop = screen.getByRole("dialog").parentElement!;
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when pressing Escape", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal open={true} onClose={onClose}>
        <p>Content</p>
      </Modal>
    );
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders title when provided", () => {
    render(
      <Modal open={true} onClose={() => {}} title="Edit Experience">
        <p>Content</p>
      </Modal>
    );
    expect(screen.getByText("Edit Experience")).toBeInTheDocument();
  });
});
