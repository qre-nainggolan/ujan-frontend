import "../../css/style2.css";
import "../../css/style_popup.css";
import "../../css/summary_management.css";
import "../../css/test_engine.css";
import NavLane from "../../NavLane";
import Footer from "../../Footer";
import Header from "../../Header";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStore } from "../../app/store/store";
import { useEffect, useRef, useState } from "react";

export default observer(function PackageTest() {
  const navigate = useNavigate();

  const { TestStore } = useStore();
  const {
    packageDetail,
    currentQuestion,
    remainingTime,
    isStarted,
    selectedChoice,
    answerList,
    answerAndAdvance,
    setSelectedChoice,
    jumpToQuestion,
    submitTest,
    sessionExpired,
    loadPackageDetail,
    testFinished,
    isLast,
    initTest,
    isLoadingSession,
    filteredDetails,
    filterStatus,
    setFilterStatus,
    questionNumberList,
    summary,
  } = TestStore;

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const [popupConfirmationClass, setPopupConfirmationclass] = useState(
    "popup__confirmation"
  );
  const [showNavPanel, setShowNavPanel] = useState(true);
  const [showTimer, setShowTimer] = useState(true);

  const popupRef = useRef<HTMLDivElement>(null);
  const pos = useRef({
    x: 0,
    y: 0,
    startX: 0,
    startY: 0,
    dragging: false,
  });

  // init test + load title
  // useEffect(() => {
  //   loadPackageDetail(forParam);
  //   initTest();
  // }, [forParam]);
  function formatDate(ts: string) {
    if (!ts) return "-";

    // Split by space
    const parts = ts.split(" ");
    const datePart = parts[0]; // 2025-11-29
    const timePart = parts[1]; // 19:34:43.474044

    // Remove microseconds
    const time = timePart.split(".")[0]; // 19:34:43

    // Format date into Indonesian
    const [year, month, day] = datePart.split("-");
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    return `${day} ${monthNames[parseInt(month) - 1]} ${year} ${time}`;
  }

  useEffect(() => {
    initTest();
    loadPackageDetail();
  }, []);

  // draggable confirmation popup listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!pos.current.dragging || !popupRef.current) return;
      const dx = e.clientX - pos.current.startX;
      const dy = e.clientY - pos.current.startY;
      popupRef.current.style.transform = `translate(${pos.current.x + dx}px, ${
        pos.current.y + dy
      }px)`;
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!pos.current.dragging) return;
      pos.current.x += e.clientX - pos.current.startX;
      pos.current.y += e.clientY - pos.current.startY;
      pos.current.dragging = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleFinalSubmitClick = () => {
    setPopupConfirmationclass("popup__confirmation-show");
  };

  const handleConfirmSubmit = async () => {
    await submitTest();
    setPopupConfirmationclass("popup__confirmation");
  };

  return (
    <div className="layout">
      <Header />
      <div className="layout__body">
        <NavLane />
        <main className="layout__main">
          {isLoadingSession ? (
            <div className="spinner-wrapper">
              <div className="spinner" />
              <div className="spinner-message">Sedang memuat halaman...</div>
            </div>
          ) : testFinished ? (
            <>
              <div className="back-button-container">
                <button
                  className="back-button"
                  onClick={() => navigate("/Package")}
                >
                  ⬅ Back to Package List
                </button>
              </div>
              {summary && (
                <>
                  <div className="summary-card">
                    <h2 className="summary-title">Ringkasan Tes</h2>
                    <div className="summary-grid">
                      <div className="summary-left">
                        <div className="summary-score-circle">
                          {summary.percentage}%
                        </div>
                        <strong>Skor (%)</strong>
                      </div>
                      <div className="summary-right">
                        <div>
                          <strong>Paket</strong>
                          {summary.package_id}
                        </div>
                        <div>
                          <strong>Tipe</strong>
                          {summary.type}
                        </div>
                        <div>
                          <strong>Total Soal</strong>
                          {summary.total_questions}
                        </div>
                        <div>
                          <strong>Benar</strong>
                          {summary.total_correct}
                        </div>
                        <div>
                          <strong>Salah</strong>
                          {summary.total_wrong}
                        </div>
                        <div>
                          <strong>Tanggal Tes</strong>
                          {formatDate(summary.answered_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="summary-filter">
                    <button
                      className={`filter-btn ${
                        filterStatus === "all" ? "active" : ""
                      }`}
                      onClick={() => {
                        console.log("all");
                        setFilterStatus("all");
                      }}
                    >
                      Semua
                    </button>

                    <button
                      className={`filter-btn ${
                        filterStatus === "correct" ? "active" : ""
                      }`}
                      onClick={() => {
                        console.log("correct");
                        setFilterStatus("correct");
                      }}
                    >
                      Benar ✔️
                    </button>

                    <button
                      className={`filter-btn ${
                        filterStatus === "wrong" ? "active" : ""
                      }`}
                      onClick={() => {
                        console.log("wrong");
                        setFilterStatus("wrong");
                      }}
                    >
                      Salah ❌
                    </button>
                  </div>
                  <table className="test-detail-table">
                    <thead>
                      <tr>
                        <th rowSpan={2} style={{ textAlign: "center" }}>
                          No
                        </th>
                        <th rowSpan={2} style={{ textAlign: "center" }}>
                          Pertanyaan
                        </th>
                        <th colSpan={2} style={{ textAlign: "center" }}>
                          Jawaban
                        </th>
                        <th rowSpan={2} style={{ textAlign: "center" }}>
                          Status
                        </th>
                        <th rowSpan={2} style={{ textAlign: "center" }}>
                          Penjelasan
                        </th>
                      </tr>
                      <tr>
                        <th style={{ textAlign: "center" }}>Asli</th>
                        <th style={{ textAlign: "center" }}>User</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDetails.map((d, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td data-label="Soal">{d.questionText}</td>
                          <td data-label="Jawaban Asli">{d.answerText}</td>
                          <td data-label="Jawaban Anda">{d.answer}</td>
                          <td data-label="Status">
                            {d.is_correct ? (
                              <span className="correct">✔ Benar</span>
                            ) : (
                              <span className="wrong">✘ Salah</span>
                            )}
                          </td>
                          <td data-label="Penjelasan">{d.explanation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </>
          ) : isStarted && currentQuestion ? (
            <>
              <h1>{packageDetail}</h1>
              <div className="timer-wrapper">
                {remainingTime > 300 && (
                  <button
                    onClick={() => setShowTimer(!showTimer)}
                    className="button--timer"
                  >
                    <span style={{ fontSize: "1.8rem" }}>
                      {showTimer ? "👁" : "👁‍🗨"}
                    </span>
                    {showTimer
                      ? "Sembunyikan Sisa Waktu"
                      : "Tampilkan Sisa Waktu"}
                  </button>
                )}
                {(showTimer || remainingTime < 300) && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <h2 style={{ margin: 0 }}>Sisa Waktu:</h2>
                    <h1 style={{ margin: 0 }}>
                      {Math.floor(remainingTime / 60)}:
                      {String(remainingTime % 60).padStart(2, "0")}
                    </h1>
                  </div>
                )}
              </div>
              <div style={{ padding: ".25rem", position: "relative" }}>
                {currentQuestion.image &&
                  currentQuestion.image.trim() !== "" && (
                    <div style={{ textAlign: "left", marginBottom: ".25rem" }}>
                      <img
                        src={
                          currentQuestion.image.startsWith("/static/")
                            ? `${API_URL}${currentQuestion.image}`
                            : `${API_URL}${currentQuestion.image}`
                        }
                        alt="Question Illustration"
                        style={{
                          maxWidth: "37.5rem",
                          height: "auto",
                          borderRadius: ".25rem",
                          boxShadow: "0 .3rem 1rem rgba(0,0,0,0.15)",
                        }}
                      />
                    </div>
                  )}
                <div className="question--wrapper">
                  {currentQuestion.questionNumber}.{currentQuestion.text}
                </div>
                <form>
                  {currentQuestion.choices.map((choice, idx) => (
                    <div key={idx} style={{ marginBottom: "1rem" }}>
                      <label style={{ fontSize: "1.6rem" }}>
                        <input
                          type="radio"
                          name="choice"
                          value={choice}
                          checked={selectedChoice === choice}
                          onChange={() => setSelectedChoice(choice)}
                          style={{ marginRight: "1rem" }}
                        />
                        {choice}
                      </label>
                    </div>
                  ))}
                </form>
                <div className="mobile-buttons">
                  <button
                    className="button--go"
                    onClick={answerAndAdvance}
                    style={{ fontSize: "1.5rem", marginRight: ".75rem" }}
                  >
                    Simpan Jawaban
                  </button>
                  {isLast ? (
                    <></>
                  ) : (
                    <>
                      <button
                        className="button--go"
                        style={{ fontSize: "1.5rem", marginRight: ".75rem" }}
                        onClick={() => {
                          console.log(currentQuestion.questionNumber);
                          console.log(answerList);
                          const answered = answerList.find(
                            (a) =>
                              a.questionNumber ===
                              currentQuestion.questionNumber + 1
                          );

                          jumpToQuestion(
                            answered
                              ? answered.questionId
                              : currentQuestion.questionNumber + 1,
                            currentQuestion.questionNumber + 1,
                            answered ? true : false
                          );
                        }}
                      >
                        Lewati Soal
                      </button>
                    </>
                  )}
                  <button
                    className="button--go"
                    onClick={handleFinalSubmitClick}
                    style={{
                      fontSize: "1.5rem",
                    }}
                  >
                    Serahkan Ujian
                  </button>
                </div>
                <div className="answer-list-panel--container">
                  <div
                    className="answer-panel-header"
                    onClick={() => setShowNavPanel(!showNavPanel)}
                  >
                    List Soal
                    <span className={showNavPanel ? "arrow-down" : "arrow-up"}>
                      ⌄
                    </span>
                  </div>

                  <div
                    className="answer-grid-wrapper"
                    style={{ maxHeight: showNavPanel ? "260px" : "0px" }}
                  >
                    <div className="answer-grid">
                      {questionNumberList.map((num) => {
                        const answered = answerList.find(
                          (a) => a.questionNumber === num
                        );
                        const questionId_ = answered?.questionId || num;
                        const isCurrent =
                          currentQuestion?.questionNumber === num;

                        return (
                          <button
                            key={num}
                            onClick={() =>
                              jumpToQuestion(
                                questionId_,
                                num,
                                answered ? true : false
                              )
                            }
                            className="button--question-navigation"
                            style={{
                              border: isCurrent
                                ? "2px solid #004ba0"
                                : "1px solid #ccc",
                              backgroundColor: answered ? "#8bc740" : "#f3f3f3",
                              color: isCurrent
                                ? "#004ba0"
                                : answered
                                ? "white"
                                : "#333",
                            }}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : sessionExpired ? (
            <>
              <h2>Session expired</h2>
              <p>Waktu ujian sudah habis. Silakan mulai ulang.</p>
            </>
          ) : (
            <>
              <div className="notification-big--wrapper">
                <h3>
                  Test sudah berakhir atau tidak di temukan, silahkan pilih
                  kembali
                </h3>
                <button onClick={() => navigate("/Package")}>
                  Back to Package List
                </button>
              </div>
            </>
          )}
        </main>
      </div>
      <Footer />
      <div className={popupConfirmationClass}>
        <div
          className="popup__confirmation__overlay"
          onClick={() => setPopupConfirmationclass("popup__confirmation")}
        ></div>
        <div
          className="popup__confirmation__content fancy"
          ref={popupRef}
          onMouseDown={(e) => {
            pos.current.dragging = true;
            pos.current.startX = e.clientX;
            pos.current.startY = e.clientY;
          }}
        >
          <h3 className="popup__confirmation__title">Submit Confirmation</h3>
          <p className="popup__confirmation__text">
            Are you sure you want to finish the exam?
          </p>
          <div className="popup__confirmation__buttons">
            <button
              className="popup__confirmation__button popup__confirmation__button--yes"
              onClick={handleConfirmSubmit}
            >
              ✅ Yes, submit
            </button>
            <button
              className="popup__confirmation__button popup__confirmation__button--cancel"
              onClick={() => setPopupConfirmationclass("popup__confirmation")}
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
