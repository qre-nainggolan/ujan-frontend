import "../../css/style2.css";
import "../../css/form.css";
import "../../css/style_popup.css";
import { useEffect, useState } from "react";
import NavLane from "../../NavLane";
import Footer from "../../Footer";
import Header from "../../Header";
import PopupModal from "../component/PopupModal";
import ConfirmationPopup from "../component/ConfirmationPopup";
import DataGrid from "../component/DataGrid";
import { useStore } from "../../app/store/store";
import { toast } from "react-toastify";
import { observer } from "mobx-react-lite";
import { ListQuestion } from "../../app/model/ListQuestion";
import { ColumnDefinition } from "../../app/model/ColumnDefinition";
import { QuestionSubmissionValues } from "../../app/model/QuestionSubmissionValues";

export default observer(function QuestionGrid() {
  const { QuestionStore } = useStore();
  const [Package_ID, SetPackage_ID] = useState("");

  const {
    data,
    fetchData,
    totalPages,
    listMainPackage,
    loadMainPackage,
    listTypePackage,
    loadTypePackage,
    totalData,
    currentPage,
    pageSize,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    form,
    setForm,
    setField,
    clearForm,
    isEditMode,
    setEditMode,
    showModal,
    setShowModal,
    showConfirmation,
    setShowConfirmation,
    Type_ID_Grid,
    setTypeIDGrid,
    listTypePackageGrid,
    loadTypePackageGrid,
  } = QuestionStore;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const questionColumns: ColumnDefinition<ListQuestion>[] = [
    {
      header: "#",
      key: "row_index",
      render: (_: ListQuestion, i: number) =>
        i + 1 + (currentPage - 1) * pageSize,
      align: "right",
      width: 20,
    },
    {
      header: "Paket",
      key: "Package_Name",
      group: "Paket",
      width: 150,
    },
    {
      header: "Jenis",
      key: "Type_ID",
      group: "Paket",
      width: 130,
    },
    {
      header: "Pertanyaan",
      key: "Question",
      wrap: true,
      width: 400,
    },
    {
      header: "Option A",
      key: "OptionA",
      width: 300,
    },
    {
      header: "Option B",
      key: "OptionB",
      width: 300,
    },
    {
      header: "Option C",
      key: "OptionC",
      width: 300,
    },
    {
      header: "Option D",
      key: "OptionD",
      width: 300,
    },
    {
      header: "Option E",
      key: "OptionE",
      width: 300,
    },
    {
      header: "Jawaban",
      key: "Answer_Text",
      width: 200,
    },
    {
      header: "Penjelasan",
      key: "Explanation",
      width: 200,
    },
    {
      header: "Time",
      key: "DateCreate",
      width: 160,
      render: (row: ListQuestion) =>
        new Date(row.DateCreate).toLocaleString("en-GB", {
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

  useEffect(() => {
    fetchData(Package_ID, "", startDate, endDate, currentPage, pageSize);
  }, [Package_ID, "", startDate, endDate]);

  useEffect(() => {
    loadMainPackage();
  }, []);

  useEffect(() => {
    loadTypePackage(form?.Package_ID || "");
  }, [form?.Package_ID]);

  const handleChangeFromStore = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setField(name as keyof QuestionSubmissionValues, value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    setField("imageFile" as keyof QuestionSubmissionValues, file);

    const previewURL = file ? URL.createObjectURL(file) : null;
    setField("imagePreview" as keyof QuestionSubmissionValues, previewURL);
  };

  return (
    <>
      <div className="layout">
        <Header />
        {/* Main layout body: nav + content */}
        <div className="layout__body">
          <NavLane />
          <main className="layout__main">
            <div className="sensor-container">
              <div className="controls">
                <select
                  value={Package_ID}
                  onChange={(e) => {
                    SetPackage_ID(e.target.value);
                    loadTypePackageGrid(e.target.value);
                  }}
                  className="selection__input"
                >
                  <option value="">Pilihan Paket</option>
                  {listMainPackage.map((row) => (
                    <option key={row.Package_ID} value={row.Package_ID + ""}>
                      {row.Name}
                    </option>
                  ))}
                </select>
                <select
                  id="Type_ID_Grid"
                  data-testid="type_id_grid"
                  className="selection__input"
                  value={Type_ID_Grid}
                  onChange={(e) => {
                    setTypeIDGrid(e.target.value);
                  }}
                  required
                >
                  <option value="">-- Pilih Jenis Paket --</option>
                  {listTypePackageGrid ? (
                    listTypePackageGrid.map((row) => (
                      <option
                        key={`form-${row.Type_ID}`}
                        value={row.Type_ID + ""}
                      >
                        {row.Type_Name}
                      </option>
                    ))
                  ) : (
                    <></>
                  )}
                </select>
                <input
                  type="datetime-local"
                  className="selection__input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                  type="datetime-local"
                  className="selection__input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <div style={{ marginLeft: ".25rem" }}>
                  <button
                    onClick={() => {
                      fetchData(
                        Package_ID,
                        "",
                        startDate,
                        endDate,
                        1,
                        pageSize
                      );
                    }}
                  >
                    Refresh
                  </button>
                  <button
                    data-testid="button-add"
                    style={{ marginLeft: ".25rem" }}
                    onClick={() => {
                      setEditMode(false);
                      clearForm();
                      setShowModal(true);
                      setForm(new QuestionSubmissionValues());
                    }}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      if (selectedIndex === null || !data)
                        return alert("Select a row first");
                      const selected = data[selectedIndex];
                      setEditMode(true);
                      setShowModal(true);
                      setForm(new QuestionSubmissionValues(selected));
                    }}
                    disabled={selectedIndex === null}
                    style={{ marginLeft: "0.5rem" }}
                  >
                    Edit
                  </button>
                </div>
              </div>
              <DataGrid
                data={data || []}
                columns={questionColumns}
                lockable={true}
                selectedIndex={selectedIndex}
                onRowClick={(_, i) => setSelectedIndex(i)}
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={totalData}
                pageSize={pageSize}
                onPageChange={(newPage) => {
                  fetchData(
                    Package_ID,
                    "",
                    startDate,
                    endDate,
                    newPage,
                    pageSize
                  );
                }}
                onPageSizeChange={(newSize) => {
                  fetchData(Package_ID, "", startDate, endDate, 1, newSize);
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
                <label htmlFor="Package_ID">Paket</label>
                <select
                  name="Package_ID"
                  data-testid="package-id"
                  className="selection__input"
                  value={form?.Package_ID}
                  onChange={(e) => {
                    e.preventDefault();

                    handleChangeFromStore(e);
                  }}
                  required
                >
                  <option value="">-- Pilih Paket --</option>
                  {listMainPackage ? (
                    listMainPackage.map((row) => (
                      <option
                        key={`form-${row.Package_ID}`}
                        value={row.Package_ID + ""}
                      >
                        {row.Name}
                      </option>
                    ))
                  ) : (
                    <></>
                  )}
                </select>
              </div>
              <div>
                <label htmlFor="Type_ID">Type</label>
                <select
                  name="Type_ID"
                  id="Type_ID"
                  data-testid="type"
                  className="selection__input"
                  value={form?.Type_ID}
                  onChange={handleChangeFromStore}
                  required
                >
                  <option value="">-- Pilih Jenis Paket --</option>
                  {listTypePackage ? (
                    listTypePackage.map((row) => (
                      <option
                        key={`form-${row.Type_ID}`}
                        value={row.Type_ID + ""}
                      >
                        {row.Type_Name}
                      </option>
                    ))
                  ) : (
                    <></>
                  )}
                </select>
              </div>
            </div>
            <label htmlFor="Question">Text Pertanyaan</label>
            <textarea
              data-testid="question"
              name="Question"
              id="Question"
              className="selection__input"
              value={form?.Question}
              onChange={handleChangeFromStore}
              required
            />
            <div className="form-row">
              <div>
                <label htmlFor="OptionA">Option A</label>
                <input
                  id="OptionA"
                  name="OptionA"
                  className="selection__input"
                  value={form?.OptionA}
                  onChange={handleChangeFromStore}
                />
              </div>
              <div>
                <label htmlFor="OptionB">Option B</label>
                <input
                  id="OptionB"
                  name="OptionB"
                  className="selection__input"
                  value={form?.OptionB}
                  onChange={handleChangeFromStore}
                />
              </div>
            </div>
            <div className="form-row">
              <div>
                <label htmlFor="OptionC">Option C</label>
                <input
                  id="OptionC"
                  name="OptionC"
                  className="selection__input"
                  value={form?.OptionC}
                  onChange={handleChangeFromStore}
                />
              </div>
              <div>
                <label htmlFor="OptionD">Option D</label>
                <input
                  id="OptionD"
                  name="OptionD"
                  className="selection__input"
                  value={form?.OptionD}
                  onChange={handleChangeFromStore}
                />
              </div>
            </div>
            <div className="form-row">
              <div>
                <label htmlFor="OptionE">Option E</label>
                <input
                  id="OptionE"
                  name="OptionE"
                  className="selection__input"
                  value={form?.OptionE}
                  onChange={handleChangeFromStore}
                />
              </div>
              <div>
                <label>Correct Answer</label>
                <div className="radio-group">
                  {["A", "B", "C", "D", "E"].map((option) => (
                    <label key={option} className="radio-option">
                      <input
                        data-testid={`radio-${option}`}
                        type="radio"
                        name="Answer"
                        value={option}
                        checked={form?.Answer === option}
                        onChange={handleChangeFromStore}
                        required
                      />
                      <span className="custom-radio" />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="form-row">
              <div>
                <label key="imageQuestion" htmlFor="image">
                  Gambar
                </label>
                <input
                  data-testid={`imageQuestion`}
                  name="ImageQuestion"
                  type="file"
                  accept="image/*"
                  className="selection__input"
                  onChange={handleImageChange}
                />
              </div>
              <div>
                <label>Preview</label>
                <div style={{ marginTop: "0.5rem" }}>
                  {form?.imagePreview ? (
                    <img
                      src={form.imagePreview}
                      alt="Preview"
                      style={{
                        width: "120px",
                        height: "auto",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                      }}
                    />
                  ) : (
                    <span style={{ color: "#aaa" }}>No image</span>
                  )}
                </div>
              </div>
            </div>
            <label htmlFor="Explanation">Penjelasan</label>
            <textarea
              data-testid="explanation"
              name="Explanation"
              id="Explanation"
              className="selection__input"
              value={form?.Explanation}
              onChange={handleChangeFromStore}
              required
            />

            <div className="form-row">
              <button
                data-testid="submit-confirm"
                className="btn btn--green"
                type="button"
                onClick={() => {
                  console.log("Check");
                  setShowConfirmation(true);
                }}
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
          onCancel={() => setShowConfirmation(false)}
          // onConfirm={submitQuestion}
          onConfirm={async () => {
            try {
              await QuestionStore.submitQuestion();

              setForm(new QuestionSubmissionValues());
              setShowConfirmation(false);
              setShowModal(false);
              fetchData(
                Package_ID,
                "",
                startDate,
                endDate,
                currentPage,
                pageSize
              );
              toast.success("Pertanyaan berhasil ditambahkan!");
            } catch (err: any) {
              console.error("Error submitting question:", err);

              if (err.response) {
                const status = err.response.status;
                const message = err.response.data?.error;

                if (status === 409) {
                  toast.error(
                    message || "Jenis paket ini sudah ada dan aktif."
                  );
                } else {
                  toast.error("Terjadi kesalahan saat menambahkan paket.");
                }
              } else if (err.request) {
                toast.error("Tidak dapat terhubung ke server.");
              } else {
                toast.error("Terjadi kesalahan tak terduga.");
              }
            }
          }}
          testIdSubmitButton="final-confirmation-button"
        />
      </div>
    </>
  );
});
