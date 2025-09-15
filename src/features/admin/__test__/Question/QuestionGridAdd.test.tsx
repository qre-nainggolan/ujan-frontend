import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import QuestionGrid from "../../QuestionGrid";
import { ToastContainer } from "react-toastify";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("Check the adding function", () => {
  it("Click add button and fill the information", async () => {
    render(
      <MemoryRouter>
        <QuestionGrid />
        <ToastContainer />
      </MemoryRouter>
    );

    const addButton = screen.getByTestId("button-add");
    fireEvent.click(addButton);

    await waitFor(() =>
      expect(screen.getByText(/Tambah Soal/i)).toBeInTheDocument()
    );

    const packetSelect = (await screen.getByTestId(
      "package-id"
    )) as HTMLSelectElement;

    for (let i = 0; i < packetSelect.options.length; i++) {
      const option = packetSelect.options[i];
      await userEvent.selectOptions(packetSelect, option.value);
      expect(packetSelect.value).toBe(option.value);
    }

    const firstOptionValue = packetSelect.options[1].value;

    fireEvent.change(packetSelect, {
      target: { value: firstOptionValue },
    });

    const packetTypeSelect = (await screen.getByTestId(
      "type"
    )) as HTMLSelectElement;

    for (let i = 0; i < packetTypeSelect.options.length; i++) {
      const option = packetTypeSelect.options[i];
      await userEvent.selectOptions(packetTypeSelect, option.value);
      await expect(packetTypeSelect.value).toBe(option.value);
    }

    const firstOptionValue_ = await packetTypeSelect.options[1].value;
    fireEvent.change(packetTypeSelect, {
      target: { value: firstOptionValue_ },
    });

    fireEvent.change(screen.getByLabelText(/Text Pertanyaan/i), {
      target: { value: "Tester Question From Automation" },
    });

    fireEvent.change(screen.getByLabelText(/Option A/i), {
      target: { value: "Test Option A" },
    });

    fireEvent.change(screen.getByLabelText(/Option B/i), {
      target: { value: "Test Option B" },
    });

    fireEvent.change(screen.getByLabelText(/Option C/i), {
      target: { value: "Test Option C" },
    });

    fireEvent.change(screen.getByLabelText(/Option D/i), {
      target: { value: "Test Option D" },
    });

    fireEvent.change(screen.getByLabelText(/Option E/i), {
      target: { value: "Test Option E" },
    });

    const radioE = screen.getByTestId("radio-E");
    await userEvent.click(radioE);
    expect(radioE).toBeChecked();

    const confirmButton = await screen.findByTestId("submit-confirm");
    await fireEvent.click(confirmButton);

    const globalConfirmButton = await screen.findByTestId(
      "final-confirmation-button"
    );

    expect(screen.getByText("Yes, submit")).toBeInTheDocument();

    await fireEvent.click(globalConfirmButton);

    await waitFor(() =>
      expect(
        screen.getByText(/Pertanyaan berhasil ditambahkan!/i)
      ).toBeInTheDocument()
    );
  });
});
