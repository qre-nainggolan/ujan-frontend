import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import PackageTest from "../../PackageTest";
import { ToastContainer } from "react-toastify";
import { store } from "../../../../app/store/store";

// const originalError = console.error;

beforeAll(() => {
  store.CommonStore.setToken(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkaXNwbGF5TmFtZSI6InB1YmxpYyIsImV4cCI6MTc1MjA3ODc5NCwidXNlcm5hbWUiOiJwdWJsaWMifQ.JAcpcUgfzPw0rF8k0eO-dOxFZ5puG8_LBKk0Ge-dGcw"
  );
  localStorage.setItem(
    "ujanTestSessionId",
    "4a6d097c-1a85-4712-bcdd-5c6d3c12f5f1"
  );
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  // console.error = (msg, ...args) => {
  //   if (
  //     typeof msg === "string" &&
  //     msg.includes("Error loading package detail")
  //   ) {
  //     return; // suppress
  //   }
  //   originalError(msg, ...args);
  // };
});

// afterAll(() => {
//   console.error = originalError; // restore
// });

describe("Check the adding function", () => {
  it("Click add button and fill the information", async () => {
    render(
      <MemoryRouter>
        <PackageTest />
        <ToastContainer />
      </MemoryRouter>
    );

    await waitFor(async () => {
      const startedCheck = screen.queryByText(/Sisa Waktu/i);

      if (startedCheck) {
        expect(screen.getByText(/Sisa Waktu/i)).toBeInTheDocument();
      } else {
        const GoButton = await screen.getByTestId("button-go");
        fireEvent.click(GoButton);

        await waitFor(() =>
          expect(screen.getByText(/Sisa Waktu/i)).toBeInTheDocument()
        );

        const radioA = screen.getByTestId("radio-1");
        await userEvent.click(radioA);
        expect(radioA).toBeChecked();

        const AnswerButton_1 = screen.getByTestId("button-confirmation-answer");
        fireEvent.click(AnswerButton_1);

        await waitFor(() =>
          expect(screen.getByText(/2./i)).toBeInTheDocument()
        );
      }
    });
  });
});
