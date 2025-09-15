import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import PackageGrid from "../../PackageGrid";
import { ToastContainer } from "react-toastify";

type Package_Type_ = {
  Package_ID: string;
  Type_ID: string;
  Package_Name: string;
  Type_Name: string;
  Active: string;
  Description: string;
  Start_Date: string;
  End_Date: string;
  Date_Create: string;
  Level: string;
  Image: string;
  Total_Question: number;
};

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

function formatDateForBackend(dateStr: string) {
  const date = new Date(dateStr);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

describe("Check the edit functionality", () => {
  it("Click edit button and get the information", async () => {
    render(
      <MemoryRouter>
        <PackageGrid />
        <ToastContainer />
      </MemoryRouter>
    );

    // Wait for the first row to be rendered
    const firstRow = await screen.findByTestId("data-grid-row-1");
    const rowDataJson = firstRow.getAttribute("data-row-json");
    const rowData: Package_Type_ = JSON.parse(rowDataJson!);

    await userEvent.click(firstRow);

    const editButton = screen.getByTestId("button-edit");
    fireEvent.click(editButton);

    await waitFor(() =>
      expect(screen.getByText(/Edit Soal/i)).toBeInTheDocument()
    );

    const packetSelect = (await screen.getByTestId(
      "packet-name"
    )) as HTMLSelectElement;

    const selectedOptionText =
      packetSelect.options[packetSelect.selectedIndex].text.trim();
    expect(selectedOptionText).toBe(rowData.Package_Name);

    const Type_ID_Input = (await screen.getByTestId(
      "type-id"
    )) as HTMLInputElement;
    await userEvent.type(Type_ID_Input, "test value");

    const Type_Name_Input = (await screen.getByTestId(
      "type-name"
    )) as HTMLTextAreaElement;

    const Type_Name_Value = Type_Name_Input.value.trim();

    expect(Type_Name_Value).toBe(rowData.Type_Name);

    const statusSelect = (await screen.getByTestId(
      "status-select"
    )) as HTMLSelectElement;

    const statusSelectText =
      statusSelect.options[statusSelect.selectedIndex].text.trim();
    expect(statusSelectText).toBe(rowData.Active);

    const descriptionInput = (await screen.getByTestId(
      "description"
    )) as HTMLInputElement;

    const descriptionText = descriptionInput.value.trim();
    expect(descriptionText).toBe(rowData.Description);

    const startDateInput = (await screen.getByTestId(
      "start-date"
    )) as HTMLInputElement;

    const startDateText = startDateInput.value.trim();
    expect(formatDateForBackend(startDateText)).toBe(
      formatDateForBackend(rowData.Start_Date)
    );

    const endDateInput = (await screen.getByTestId(
      "end-date"
    )) as HTMLInputElement;
    const endDateText = endDateInput.value.trim();

    expect(formatDateForBackend(endDateText)).toBe(
      formatDateForBackend(rowData.End_Date)
    );

    const confirmButton = await screen.findByTestId("submit-confirm");
    await fireEvent.click(confirmButton);

    const globalConfirmButton = await screen.findByTestId(
      "final-confirmation-button"
    );

    expect(screen.getByText("Yes, submit")).toBeInTheDocument();

    await fireEvent.click(globalConfirmButton);

    await waitFor(() =>
      expect(
        screen.getByText(/Paket berhasil ditambahkan!/i)
      ).toBeInTheDocument()
    );

    expect(screen.queryByTestId("popup-overlay")).not.toBeInTheDocument();
  });
});
