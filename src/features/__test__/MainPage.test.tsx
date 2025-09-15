import { render, screen, waitFor } from "@testing-library/react";

import { MemoryRouter } from "react-router-dom";
import MainPage from "../MainPage";
import { ToastContainer } from "react-toastify";

jest.mock("../../app/api/agent", () => ({
  __esModule: true,
  default: {
    Score: {
      getScoreSummary: jest.fn().mockResolvedValue({ data: [] }),
    },
    Lora: {
      getLatestValue: jest.fn().mockResolvedValue({ latestValue: "42" }),
      getCurrentGraph: jest.fn().mockResolvedValue({
        lastUpdate: "2025-06-30T10:00:00Z",
        results: [],
      }),
    },
    Account: {
      getUserProfile: jest.fn().mockResolvedValue({
        data: {
          userID: "test-user",
          nama_User: "Test User",
          user_Profile: "Admin",
          fingerprint: "",
          expired_Password: "",
          approval_Notes: "",
          lastChange: "",
          retypePassword: "",
          password: "",
          status: "",
          displayName: "",
        },
      }),
    },
  },
}));

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("Check the main page", () => {
  it("Pulling the data record", async () => {
    // const realPackages = await fetchRealPackages();
    // expect(realPackages.length).toBeGreaterThan(0);

    render(
      <MemoryRouter>
        <MainPage />
        <ToastContainer />
      </MemoryRouter>
    );

    // Wait for the package name to appear
    // await screen.findByText(new RegExp(realPackages[0].name, "i"));

    // const confirmButton = await screen.findByTestId("submit-confirm");

    console.log("Test Main Page");

    await waitFor(() =>
      expect(screen.getByText(/Ringkasan Nilai/i)).toBeInTheDocument()
    );

    await waitFor(() =>
      expect(screen.getByText(/Visual Perkembangan/i)).toBeInTheDocument()
    );
  });
});

// describe.only("This test suite runs exclusively", () => {
//   test("Only this test or suite runs", () => {
//     expect(true).toBe(true);
//   });
// });
