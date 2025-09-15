import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import PackageGrid from "../../PackageGrid";
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
        <PackageGrid />
        <ToastContainer />
      </MemoryRouter>
    );

    const addButton = screen.getByTestId("button-add");
    fireEvent.click(addButton);

    await waitFor(() =>
      expect(screen.getByText(/Tambah Soal/i)).toBeInTheDocument()
    );

    const packetSelect = (await screen.getByTestId(
      "packet-name"
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

    fireEvent.change(screen.getByLabelText(/Type ID/i), {
      target: { value: "Test Tambah 7.7 Jam 10.47" },
    });

    fireEvent.change(screen.getByLabelText(/Nama Jenis/i), {
      target: { value: "TypeTestName" },
    });

    const statusSelect = (await screen.getByTestId(
      "packet-name"
    )) as HTMLSelectElement;

    const statusSelectValue = statusSelect.options[1].value;

    fireEvent.change(statusSelect, {
      target: { value: statusSelectValue },
    });

    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "TypeTestDescription" },
    });

    const endDate = await screen.findByTestId("end-date");
    fireEvent.change(endDate, {
      target: { value: "2099-05-01" },
    });

    const startDate = await screen.findByTestId("start-date");
    fireEvent.change(startDate, {
      target: { value: "2025-05-01" },
    });

    const confirmButton = await screen.findByTestId("submit-confirm");
    await fireEvent.click(confirmButton);

    const globalConfirmButton = await screen.findByTestId(
      "final-confirmation-button"
    );

    expect(screen.getByText("Yes, submit")).toBeInTheDocument();

    await fireEvent.click(globalConfirmButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Paket berhasil ditambahkan!/i)
      ).toBeInTheDocument();
    });
  });
});
