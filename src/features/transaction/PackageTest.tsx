import "../../css/style2.css";
import "../../css/style_popup.css";
import NavLane from "../../NavLane";
import Footer from "../../Footer";
import Header from "../../Header";
import { useLocation, useNavigate } from "react-router-dom";
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
    questionNumber,
    answerAndAdvance,
    setSelectedChoice,
    jumpToQuestion,
    submitTest,
    sessionExpired,
    loadPackageDetail,
    testFinished,
    initTest,
  } = TestStore;

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const forParam = queryParams.get("for") || "";

  const [popupConfirmationClass, setPopupConfirmationclass] = useState(
    "popup__confirmation"
  );
  const [showNavPanel, setShowNavPanel] = useState(true);

  const popupRef = useRef<HTMLDivElement>(null);
  const pos = useRef({
    x: 0,
    y: 0,
    startX: 0,
    startY: 0,
    dragging: false,
  });

  // init test + load title
  useEffect(() => {
    loadPackageDetail(forParam);
    initTest();
  }, [forParam]);

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
          <h1>{packageDetail}</h1>
          {testFinished ? (
            <main className="layout__main">
              <h2>You have successfully finished the test ✅</h2>
              <button
                className="btn btn--green"
                onClick={() => navigate("/Package")}
              >
                Back to Package List
              </button>
            </main>
          ) : isStarted && currentQuestion ? (
            <>
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
              <div style={{ padding: "1rem" }}>
                <h2 style={{ fontSize: "2.4rem", marginBottom: "1.5rem" }}>
                  {questionNumber}.{currentQuestion.text}
                </h2>
                <form style={{ marginBottom: "2rem" }}>
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
                <button
                  className="button--go"
                  onClick={answerAndAdvance}
                  style={{ fontSize: "1.8rem", padding: "0.8rem 2.5rem" }}
                >
                  Konfirmasi Jawaban
                </button>
                <button
                  className="button--go"
                  onClick={handleFinalSubmitClick}
                  style={{
                    fontSize: "1.8rem",
                    padding: "0.8rem 2.5rem",
                    marginLeft: "1.5rem",
                  }}
                >
                  Serahkan Ujian
                </button>
                <div
                  style={{
                    position: "fixed",
                    top: "6rem",
                    right: "2rem",
                    width: "18rem",
                    backgroundColor: "#ffffff",
                    border: "2px solid #cce5ff",
                    borderRadius: "12px",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                    padding: "1rem",
                    zIndex: 999,
                  }}
                >
                  <div
                    onClick={() => setShowNavPanel(!showNavPanel)}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      cursor: "pointer",
                      marginBottom: "1.1rem",
                      fontSize: "1.6rem",
                      fontWeight: "600",
                    }}
                  >
                    List Jawaban
                    <span
                      style={{
                        fontSize: "2rem",
                        marginLeft: ".25rem",
                        transform: showNavPanel
                          ? "rotate(0deg)"
                          : "rotate(180deg)",
                      }}
                    >
                      ⌄
                    </span>
                  </div>
                  <div
                    style={{
                      maxHeight: showNavPanel ? "1000px" : "0",
                      overflow: "hidden",
                      transition: "max-height 0.4s ease",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(4rem, 1fr))",
                        gap: "0.6rem",
                      }}
                    >
                      {answerList.map((a, idx) => (
                        <button
                          key={a.questionId}
                          onClick={() => jumpToQuestion(a.questionId)}
                          style={{
                            padding: "0.5rem",
                            fontSize: "1.3rem",
                            borderRadius: "6px",
                            border:
                              currentQuestion.id === a.questionId
                                ? "2px solid #004ba0"
                                : "1px solid #ccc",
                            backgroundColor: a.answer ? "#8bc740" : "#f3f3f3",
                            color:
                              currentQuestion.id === a.questionId
                                ? "#004ba0"
                                : a.answer
                                ? "white"
                                : "#333",
                          }}
                        >
                          {idx + 1}
                        </button>
                      ))}
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
              <h3>
                Test sudah berakhir atau tidak di temukan, silahkan pilih
                kembali
              </h3>
              <button
                className="btn btn--green"
                onClick={() => navigate("/Package")}
              >
                Back to Package List
              </button>
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
              className="popup__confirmation__button popupConfirmation__button--yes"
              onClick={handleConfirmSubmit}
            >
              ✅ Yes, submit
            </button>
            <button
              className="popup__confirmation__button popupConfirmation__button--cancel"
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
