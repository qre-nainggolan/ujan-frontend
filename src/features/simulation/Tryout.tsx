import "../../css/style2.css";
import "../../css/style_popup.css";
import { useRef, useEffect } from "react";
import NavLane from "../../NavLane";
import Footer from "../../Footer";
import Header from "../../Header";
import { useStore } from "../../app/store/store";
import { observer } from "mobx-react-lite";

export default observer(function Tryout() {
  const { TryoutStore, UserStore } = useStore();

  const { UserProfile } = UserStore;
  const {
    IsTryoutStarted,
    CheckIsTryoutStarted,
    SetCurrentQuestionId,
    SelectedChoice,
    CurrentQuestion,
    SetSelectedChoice,
    listAnswer,
    loadQuestion,
    SubmitAnAnswer,
    ConfirmFinalSubmission,
    popupConfirmationClass,
    SetPopupConfirmationclass,
    TimeLeft,
    StartTryout,
  } = TryoutStore;

  const popupRef = useRef<HTMLDivElement>(null);
  const pos = useRef({
    x: 0, // last translateX
    y: 0, // last translateY
    startX: 0,
    startY: 0,
    dragging: false,
  });

  const handleFinalSubmitClick = () =>
    SetPopupConfirmationclass("popup__confirmation-show");

  const confirmFinalSubmit = async () => {
    if (!SelectedChoice) return;

    ConfirmFinalSubmission(localStorage.removeItem("ujanSessionId") ?? "");
    window.location.reload(); // or redirect
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!pos.current.dragging || !popupRef.current) return;

      const dx = e.clientX - pos.current.startX;
      const dy = e.clientY - pos.current.startY;

      const newX = pos.current.x + dx;
      const newY = pos.current.y + dy;

      popupRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!pos.current.dragging) return;

      const dx = e.clientX - pos.current.startX;
      const dy = e.clientY - pos.current.startY;

      pos.current.x += dx;
      pos.current.y += dy;
      pos.current.dragging = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Fetch first question
  useEffect(() => {
    CheckIsTryoutStarted();
  }, []);

  useEffect(() => {
    if (!IsTryoutStarted) return;

    loadQuestion();
  }, [IsTryoutStarted]); // ✅ removed AnswerList

  return (
    <>
      <div className="layout">
        <Header />
        {/* Main layout body: nav + content */}
        <div className="layout__body">
          <NavLane />
          <main className="layout__main">
            <h1>Simulasi - Uji coba gratis</h1>
            {IsTryoutStarted && CurrentQuestion ? (
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
                    {Math.floor(TimeLeft / 60)}:
                    {String(TimeLeft % 60).padStart(2, "0")}
                  </h1>
                </div>
                <div
                  style={{ padding: "1rem", fontFamily: "Poppins, sans-serif" }}
                >
                  <h2 style={{ fontSize: "2.4rem", marginBottom: "1.5rem" }}>
                    {CurrentQuestion!.text}
                  </h2>
                  <form style={{ marginBottom: "2rem" }}>
                    {CurrentQuestion!.choices.map((choice, index) => (
                      <div key={index} style={{ marginBottom: "1rem" }}>
                        <label style={{ fontSize: "1.6rem" }}>
                          <input
                            type="radio"
                            name="choice"
                            value={choice}
                            checked={SelectedChoice === choice}
                            onChange={() => {
                              SetCurrentQuestionId(CurrentQuestion.id);
                              SetSelectedChoice(choice);
                            }}
                            style={{ marginRight: "1rem" }}
                          />
                          {choice}
                        </label>
                      </div>
                    ))}
                  </form>
                  <button
                    className="button--go"
                    onClick={() => {
                      SubmitAnAnswer(localStorage.getItem("ujanSessionId")!);
                    }}
                    style={{ fontSize: "1.8rem", padding: "0.8rem 2.5rem" }}
                  >
                    Konfirmasi Jawaban
                  </button>
                  <button
                    className="button--go"
                    style={{
                      fontSize: "1.8rem",
                      padding: "0.8rem 2.5rem",
                      marginLeft: "1.5rem",
                    }}
                    onClick={handleFinalSubmitClick}
                  >
                    Kirimkan Submit
                  </button>
                  {listAnswer.length > 0 && (
                    <div
                      style={{
                        marginTop: "3rem",
                        padding: "2rem",
                        backgroundColor: "#f4f9ff",
                        border: "2px solid #cce5ff",
                        borderRadius: "12px",
                        fontFamily: "Poppins, sans-serif",
                        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                      }}
                    >
                      <h3 style={{ fontSize: "2rem", marginBottom: "1.2rem" }}>
                        ✅ Your Submitted Answers
                      </h3>
                      <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                        {listAnswer.map((item, index) => (
                          <li
                            key={index}
                            style={{
                              marginBottom: "0.8rem",
                              fontSize: "1.6rem",
                            }}
                          >
                            <strong>Q{item.questionId}:</strong> {item.answer}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <h3>
                  In this section, you will have 30 minutes to finish 100
                  questions of TKD, Please click the button "Go" to start the
                  Tryout
                </h3>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "5rem",
                  }}
                >
                  <button className="button--go" onClick={StartTryout}>
                    Go
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
            onClick={() => SetPopupConfirmationclass("popup__confirmation")}
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
              Apakah <b>{UserProfile?.displayName}</b> yakin untuk menyelesaikan
              simulasi?
            </p>
            <div className="popup__confirmation__buttons">
              <button
                className="popup__confirmation__button popupConfirmation__button--yes"
                onClick={confirmFinalSubmit}
              >
                ✅ Yes, submit
              </button>
              <button
                className="popup__confirmation__button popupConfirmation__button--cancel"
                onClick={() => SetPopupConfirmationclass("popup__confirmation")}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
