import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import PackageGrid from "../PackageGrid";
import { ToastContainer } from "react-toastify";

describe("Check the list of package", () => {
  it("Pulling the data record", async () => {
    // const realPackages = await fetchRealPackages();
    // expect(realPackages.length).toBeGreaterThan(0);

    render(
      <MemoryRouter>
        <PackageGrid />
        <ToastContainer />
      </MemoryRouter>
    );

    // Wait for the package name to appear
    // await screen.findByText(new RegExp(realPackages[0].name, "i"));

    // const confirmButton = await screen.findByTestId("submit-confirm");

    const packetSelect = (await screen.getByTestId(
      "list-main-package"
    )) as HTMLSelectElement;

    for (let i = 0; i < packetSelect.options.length; i++) {
      const option = packetSelect.options[i];

      await userEvent.selectOptions(packetSelect, option.value);
      expect(packetSelect.value).toBe(option.value);

      // Simulate user selecting the option
      // fireEvent.change(select, { target: { value: option.value } });

      // Optionally assert behavior
      // expect(select.value).toBe(option.value);

      // You can also test side effects, like checking for updated UI
      // expect(screen.getByText(new RegExp(option.text, 'i'))).toBeInTheDocument();
    }

    const firstOptionValue = packetSelect.options[1].value;

    console.log("firstOptionValue : " + firstOptionValue);
    fireEvent.change(packetSelect, {
      target: { value: firstOptionValue },
    });

    const startDateList = screen.getByTestId("start-date-list");
    fireEvent.change(startDateList, {
      target: { value: "2025-04-01T00:00" },
    });

    const refreshButtonList = screen.getByTestId("refresh-list-button");
    fireEvent.click(refreshButtonList);

    await waitFor(() =>
      expect(screen.getByText(/Showing 1/i)).toBeInTheDocument()
    );
  });
});

// describe("Check the adding function", () => {
//   it("Click add button and fill the information", async () => {
//     render(
//       <MemoryRouter>
//         <PackageGrid />
//         <ToastContainer />
//       </MemoryRouter>
//     );

//     const addButton = screen.getByTestId("button-add");
//     fireEvent.click(addButton);

//     await waitFor(() =>
//       expect(screen.getByText(/Tambah Soal/i)).toBeInTheDocument()
//     );

//     const packetSelect = (await screen.getByTestId(
//       "packet-name"
//     )) as HTMLSelectElement;

//     for (let i = 0; i < packetSelect.options.length; i++) {
//       const option = packetSelect.options[i];

//       await userEvent.selectOptions(packetSelect, option.value);
//       expect(packetSelect.value).toBe(option.value);
//     }

//     const firstOptionValue = packetSelect.options[1].value;

//     fireEvent.change(packetSelect, {
//       target: { value: firstOptionValue },
//     });

//     fireEvent.change(screen.getByLabelText(/Type ID/i), {
//       target: { value: "TypeTestID" },
//     });

//     fireEvent.change(screen.getByLabelText(/Nama Jenis/i), {
//       target: { value: "TypeTestName" },
//     });

//     const statusSelect = (await screen.getByTestId(
//       "packet-name"
//     )) as HTMLSelectElement;

//     const statusSelectValue = statusSelect.options[1].value;

//     fireEvent.change(statusSelect, {
//       target: { value: statusSelectValue },
//     });

//     fireEvent.change(screen.getByLabelText(/Description/i), {
//       target: { value: "TypeTestDescription" },
//     });

//     const endDate = await screen.findByTestId("end-date");
//     fireEvent.change(endDate, {
//       target: { value: "2099-05-01" },
//     });

//     const startDate = await screen.findByTestId("start-date");
//     fireEvent.change(startDate, {
//       target: { value: "2025-05-01" },
//     });

//     const confirmButton = await screen.findByTestId("submit-confirm");
//     await fireEvent.click(confirmButton);

//     const globalConfirmButton = await screen.findByTestId(
//       "global-confirmation-button"
//     );

//     expect(screen.getByText("Yes, submit")).toBeInTheDocument();

//     await fireEvent.click(globalConfirmButton);

//     await waitFor(() =>
//       expect(
//         screen.getByText(/Paket berhasil ditambahkan!/i)
//       ).toBeInTheDocument()
//     );
//   });
// });

describe("Check the edit functionality", () => {
  it("Click edit button and get the information", async () => {
    render(
      <MemoryRouter>
        <PackageGrid />
        <ToastContainer />
      </MemoryRouter>
    );

    // Wait for the first row to be rendered
    const firstRow = await screen.findByTestId("data-grid-row-0");

    // Click the first row
    await userEvent.click(firstRow);

    const editButton = screen.getByTestId("button-edit");
    fireEvent.click(editButton);

    await waitFor(() =>
      expect(screen.getByText(/Edit Soal/i)).toBeInTheDocument()
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
      target: { value: "TypeTestID" },
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
      "global-confirmation-button"
    );

    expect(screen.getByText("Yes, submit")).toBeInTheDocument();

    await fireEvent.click(globalConfirmButton);

    await waitFor(() =>
      expect(
        screen.getByText(/Paket berhasil ditambahkan!/i)
      ).toBeInTheDocument()
    );
  });
});
