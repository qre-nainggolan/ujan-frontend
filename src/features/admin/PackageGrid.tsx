import "react-datepicker/dist/react-datepicker.css";
import "../../css/style_popup.css";
import "../../css/form.css";

import { useEffect, useState } from "react";
import NavLane from "../../NavLane";
import Footer from "../../Footer";
import Header from "../../Header";
import PopupModal from "../component/PopupModal";
import ConfirmationPopup from "../component/ConfirmationPopup";
import DataGrid from "../component/DataGrid";
import { toast } from "react-toastify";
import { observer } from "mobx-react-lite";
import { useStore } from "../../app/store/store";
import { format } from "date-fns";
import Calendar from "../component/Calendar";

export default observer(function PackageBank() {
  const { PackageTypeStore } = useStore();
  const {
    listPackageType,
    listMainPackage,
    Package_ID,
    startDate,
    endDate,
    currentPage,
    totalPages,
    totalData,
    pageSize,
    formData,
    setField,
    loadMainPackages,
    loadPackageTypes,
    submitPackageType,
  } = PackageTypeStore;

  const gridColumn = [
    {
      header: "#",
      key: "index",
      render: (_: any, i: number) => i + 1 + (currentPage - 1) * pageSize,
      align: "right" as const,
    },
    { header: "Nama Paket", key: "Package_Name", width: 150 },
    { header: "ID Jenis", key: "Type_ID", width: 150 },
    { header: "Jenis", key: "Type_name", width: 150 },
    { header: "Total Pertanyaan", key: "Total_Question", width: 150 },
    {
      header: "Time",
      key: "Start_Date",
      render: (row: any) =>
        new Date(row.Start_Date).toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "UTC",
        }),
    },
  ];

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    loadMainPackages();
    loadPackageTypes(Package_ID, startDate, endDate, currentPage, pageSize);
  }, []);

  useEffect(() => {
    loadPackageTypes(Package_ID, startDate, endDate, currentPage, pageSize);
  }, [startDate, endDate]);

  return (
    <div className="layout">
      <Header />
      <div className="layout__body">
        <NavLane />
        <main className="layout__main">
          <div className="sensor-container">
            <div className="controls">
              <select
                value={Package_ID}
                onChange={(e) => setField("Package_ID", e.target.value)}
                className="selection__input"
                data-testid="list-main-package"
              >
                <option value="">Pilihan Paket</option>
                {listMainPackage.map((row) => (
                  <option key={row.Package_ID} value={row.Package_ID}>
                    {row.Name}
                  </option>
                ))}
              </select>

              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setField("startDate", e.target.value)}
                className="selection__input"
                data-testid="start-date-list"
              />

              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setField("endDate", e.target.value)}
                className="selection__input"
                data-testid="end-date-list"
              />

              <div style={{ marginLeft: ".25rem" }}>
                <button
                  data-testid="refresh-list-button"
                  onClick={() => {
                    loadPackageTypes(
                      Package_ID,
                      startDate,
                      endDate,
                      1,
                      pageSize
                    );
                    setField("currentPage", 1);
                  }}
                >
                  Refresh
                </button>
                <button
                  style={{ marginLeft: ".25rem" }}
                  data-testid="button-add"
                  onClick={() => {
                    setIsEditMode(false);
                    setField("formData", {
                      ID: 0,
                      Package_ID: "",
                      Type_ID: "",
                      Package_Name: "",
                      Type_Name: "",
                      Active: "",
                      Description: "",
                      Start_Date: "",
                      End_Date: "",
                      Date_Create: "",
                      Level: "",
                      Image: "",
                      Total_Question: 0,
                    });
                    setShowModal(true);
                  }}
                >
                  Add
                </button>
                <button
                  data-testid="button-edit"
                  disabled={selectedIndex === null}
                  style={{ marginLeft: ".5rem" }}
                  onClick={() => {
                    if (selectedIndex !== null) {
                      const selected = listPackageType[selectedIndex];
                      setIsEditMode(true);
                      setField("formData", selected);
                      setShowModal(true);
                    }
                  }}
                >
                  Edit
                </button>
              </div>
            </div>

            <DataGrid
              data={listPackageType}
              columns={gridColumn}
              dataTestid="ScoreSummaryGrid"
              selectedIndex={selectedIndex}
              onRowClick={(_, i) => setSelectedIndex(i)}
              currentPage={currentPage}
              totalPages={totalPages}
              totalRecords={totalData}
              pageSize={pageSize}
              onPageChange={(page) => {
                loadPackageTypes(
                  Package_ID,
                  startDate,
                  endDate,
                  page,
                  pageSize
                );
                setField("currentPage", page);
              }}
              onPageSizeChange={(size) => {
                setField("pageSize", size);
                setField("currentPage", 1);
                loadPackageTypes(Package_ID, startDate, endDate, 1, size);
              }}
            />
          </div>
        </main>
      </div>
      <Footer />

      <PopupModal
        title={isEditMode ? "Edit Soal" : "Tambah Soal"}
        show={showModal}
        onClose={() => setShowModal(false)}
      >
        <form className="question-form">
          <div className="form-row">
            <div>
              <label htmlFor="Package_ID">Nama Paket</label>
              <select
                name="Package_ID"
                id="Package_ID"
                className="selection__input"
                value={formData?.Package_ID}
                onChange={(e) =>
                  setField("formData", {
                    ...formData,
                    Package_ID: e.target.value,
                  })
                }
              >
                <option value="">-Pilih Paket-</option>
                {listMainPackage.map((row: any) => (
                  <option key={row.Package_ID} value={row.Package_ID}>
                    {row.Name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="Type_ID">Type ID</label>
              <input
                name="Type_ID"
                id="Type_ID"
                className="selection__input"
                value={formData?.Type_ID || ""}
                onChange={(e) =>
                  setField("formData", { ...formData, Type_ID: e.target.value })
                }
              />
            </div>
          </div>
          <label htmlFor="Type_Name">Nama Jenis</label>
          <textarea
            data-testid="type-name"
            name="Type_Name"
            id="Type_Name"
            className="selection__input"
            value={formData?.Type_Name}
            onChange={(e) =>
              setField("formData", { ...formData, Type_Name: e.target.value })
            }
            required
          />
          <div className="form-row">
            <div>
              <label htmlFor="StatusSelect">Status Active</label>
              <select
                name="StatusSelect"
                id="StatusSelect"
                value={formData?.Active}
                onChange={(e) =>
                  setField("formData", { ...formData, Active: e.target.value })
                }
                data-testid="status-select"
                className="selection__input"
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            </div>
            <div>
              <label htmlFor="Description">Description</label>
              <input
                name="Description"
                id="Description"
                data-testid="description"
                className="selection__input"
                value={formData?.Description}
                onChange={(e) =>
                  setField("formData", {
                    ...formData,
                    Description: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label htmlFor="StartDate">Start Date&nbsp;&nbsp;</label>
              <Calendar
                name="StartDate"
                dataTestId="start-date"
                id="StartDate"
                value={formData?.Start_Date}
                selected={
                  formData?.Start_Date ? new Date(formData.Start_Date) : null
                }
                onChange={(date: Date | null) => {
                  setField("formData", {
                    ...formData,
                    Start_Date: date ? format(date, "yyyy-MM-dd") : "",
                  });
                }}
                dateFormat="yyyy-MM-dd"
                className="selection__input w-full"
                wrapperClassName="w-full"
              />
            </div>
            <div>
              <label htmlFor="EndDate">End Date&nbsp;&nbsp;</label>
              <Calendar
                name="EndDate"
                id="EndDate"
                dataTestId="end-date"
                value={formData?.End_Date}
                selected={
                  formData?.End_Date ? new Date(formData.End_Date) : null
                }
                onChange={(date: Date | null) => {
                  setField("formData", {
                    ...formData,
                    End_Date: date ? format(date, "yyyy-MM-dd") : "",
                  });
                }}
                dateFormat="yyyy-MM-dd"
                className="selection__input w-full"
                wrapperClassName="w-full"
              />
            </div>
          </div>
          <div className="form-row">
            <button
              className="btn btn--green"
              type="button"
              onClick={() => setShowConfirmation(true)}
            >
              {isEditMode ? "Update" : "Submit"}
            </button>
            <button
              className="btn btn--green"
              type="button"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </PopupModal>
      <ConfirmationPopup
        show={showConfirmation}
        onConfirm={async () => {
          await submitPackageType();
          toast.success("Success!");
          setShowConfirmation(false);
          setShowModal(false);
          loadPackageTypes(Package_ID, startDate, endDate, 1, pageSize);
        }}
        onCancel={() => setShowConfirmation(false)}
        testIdSubmitButton="final-confirmation-button"
      />
    </div>
  );
});
