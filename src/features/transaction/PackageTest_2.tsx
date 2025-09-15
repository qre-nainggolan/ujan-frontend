import "../../css/style2.css";
import "../../css/style_popup.css";
import { useRef, useEffect, useState } from "react";
import NavLane from "../../NavLane";
import Footer from "../../Footer";
import Header from "../../Header";
import agent from "../../app/api/agent";
import { store } from "../../app/store/store";
import { useLocation } from "react-router-dom";

type Question_ = {
  id: number;
  text: string;
  done: boolean;
  choices: string[];
};

type AnswerLog = {
  questionId: number;
  answer: string;
};

function PackageTest() {
  const [AnswerList, SetAnswerList] = useState<AnswerLog[]>([]);
  const [popupConfirmationClass, setPopupConfirmationclass] = useState(
    "popup__confirmation"
  );
  const [CurrentQuestion, SetCurrentQuestion] = useState<Question_ | null>(
    null
  );
  const [TimeLeft, SetTimeLeft] = useState(0);
  const [CurrentQuestionId, SetCurrentQuestionId] = useState(0);
  const [IsTestStarted, SetIsTestStarted] = useState(false);
  const [SessionId, SetSessionId] = useState(
    localStorage.getItem("ujanTestSessionId") + ""
  );
  const [SelectedChoice, SetSelectedChoice] = useState<string | null>(null);
  const [HasLoadedSession, SetHasLoadedSession] = useState(false);
  const [ShowNavPanel, SetShowNavPanel] = useState(true);
  const [QuestioNumber, SetQuestionNumber] = useState(1);
  const [PackageDetail, setPackageDetail] = useState("");

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const forParam = queryParams.get("for");

  const popupRef = useRef<HTMLDivElement>(null);
  const pos = useRef({
    x: 0, // last translateX
    y: 0, // last translateY
    startX: 0,
    startY: 0,
    dragging: false,
  });

  const handleFinalSubmitClick = () =>
    setPopupConfirmationclass("popup__confirmation-show");

  const confirmFinalSubmit = async () => {
    if (!SelectedChoice) return;

    try {
      await agent.UserPackage.submitTest({
        sessionId: localStorage.getItem("ujanTestSessionId")!,
        questionId: CurrentQuestion?.id ?? 0,
        answer: SelectedChoice,
      }); // Call backend to move data
      alert("Final submission successful! Answers saved to database.");
      setPopupConfirmationclass("popup__confirmation");
      localStorage.removeItem("ujanTestSessionId");
      window.location.reload(); // or redirect
    } catch (error) {
      console.log(error);
      alert("Failed to submit answers. ");
    }
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

  const sid = localStorage.getItem("ujanTestSessionId") || "";

  // Fetch first question
  useEffect(() => {
    agent.UserPackage.getDetailPackage(forParam || "")
      .then((response: any) => {
        setPackageDetail(response.data);
        console.log(response);
      })
      .catch((err) => console.log("Error loading package detail", err));

    if (SessionId == "undefined") {
      SetIsTestStarted(false);
    } else {
      SetIsTestStarted(true);

      agent.UserPackage.getTestSession(SessionId).then((response) => {
        const session = response.data.session;
        SetCurrentQuestionId(session.currentQuestionId);
        SetTimeLeft(session.remainingTime);
        SetHasLoadedSession(true);
      });

      agent.UserPackage.getTestAnswer(SessionId)
        .then((response) => {
          const savedAnswers = response.data;
          SetAnswerList(savedAnswers);
        })
        .catch((err) => console.error("Error loading saved answers", err));
    }
  }, []);

  useEffect(() => {
    if (!HasLoadedSession || !IsTestStarted) return;

    const loadQuestion = async () => {
      try {
        const res = await agent.UserPackage.continueTest(
          SessionId,
          CurrentQuestionId,
          ""
        );
        if (!res.data.done) {
          SetCurrentQuestion(res.data.question);
          SetSelectedChoice(null);
        }
      } catch (err) {
        console.error("Failed to continue tryout:", err);
      }
    };

    loadQuestion();
  }, [HasLoadedSession, IsTestStarted]); // ✅ removed AnswerList

  useEffect(() => {
    if (!IsTestStarted || TimeLeft <= 0) return;

    const interval = setInterval(() => {
      SetTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          alert("Time is up!");
          SetIsTestStarted(false);
          localStorage.removeItem("ujanTestSessionId");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [IsTestStarted, TimeLeft]);

  const handleAnswer = async () => {
    if (!SelectedChoice) return;

    const submittedAnswer = {
      sessionId: localStorage.getItem("ujanTestSessionId")!,
      questionId: CurrentQuestion?.id ?? 0,
      answer: SelectedChoice,
    };

    agent.UserPackage.answerTest({
      sessionId: localStorage.getItem("ujanTestSessionId")!,
      questionId: CurrentQuestion?.id ?? 0,
      answer: SelectedChoice!,
    });

    // Update answer log
    SetAnswerList((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.questionId === submittedAnswer.questionId
      );
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = submittedAnswer;
        return updated;
      }
      return [...prev, submittedAnswer];
    });

    const res = await agent.UserPackage.continueTest(
      sid!,
      CurrentQuestion?.id ?? 0,
      ""
    );

    if (res.data.done) {
      // show summary
    } else {
      SetCurrentQuestion(res.data.question);
    }

    const matched = AnswerList.findIndex(
      (a) => a.questionId === res.data.question.id
    );
    SetQuestionNumber(matched + 1 || QuestioNumber + 1);
    SetSelectedChoice(AnswerList[matched]?.answer || null);
  };

  const handleStart = async () => {
    await agent.UserPackage.startTest().then((response) => {
      const data = response.data;

      localStorage.setItem("ujanTestSessionId", data.sessionId); // 🔐 Save session ID
      SetCurrentQuestion(data.question);
      SetTimeLeft(data.timeLeft); // timeLeft comes from backend
      SetIsTestStarted(true);
      SetSessionId(data.sessionId);
    });
  };

  return (
    <>
      <div className="layout">
        <Header />
        {/* Main layout body: nav + content */}
        <div className="layout__body">
          <NavLane />
          <main className="layout__main">
            <h1>{PackageDetail}</h1>
            {IsTestStarted && CurrentQuestion ? (
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
                    {QuestioNumber + "." + CurrentQuestion!.text}
                  </h2>
                  <form style={{ marginBottom: "2rem" }}>
                    {CurrentQuestion!.choices.map((choice, index) => (
                      <div key={index} style={{ marginBottom: "1rem" }}>
                        <label style={{ fontSize: "1.6rem" }}>
                          <input
                            data-testid={`radio-${index}`}
                            type="radio"
                            name="choice"
                            value={choice}
                            checked={SelectedChoice === choice}
                            onChange={() => SetSelectedChoice(choice)}
                            style={{ marginRight: "1rem" }}
                          />
                          {choice}
                        </label>
                      </div>
                    ))}
                  </form>
                  <button
                    className="button--go"
                    data-testid="button-confirmation-answer"
                    onClick={handleAnswer}
                    style={{ fontSize: "1.8rem", padding: "0.8rem 2.5rem" }}
                  >
                    Konfirmasi Jawaban
                  </button>
                  <button
                    className="button--go"
                    data-testid="button-submit-answer"
                    style={{
                      fontSize: "1.8rem",
                      padding: "0.8rem 2.5rem",
                      marginLeft: "1.5rem",
                    }}
                    onClick={handleFinalSubmitClick}
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
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    {/* Clickable Header with Icon */}
                    <div
                      onClick={() => SetShowNavPanel((prev) => !prev)}
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "left",
                        gap: "0.5rem",
                        cursor: "pointer",
                        userSelect: "none",
                        marginBottom: "1.1rem",
                        fontSize: "1.6rem",
                        fontWeight: "600",
                        color: "#333",
                        transition: "all 0.3s ease",
                      }}
                    >
                      List Jawaban
                      <span
                        style={{
                          transition: "transform 0.3s ease",
                          fontSize: "2rem",
                          transform: ShowNavPanel
                            ? "rotate(0deg)"
                            : "rotate(180deg)",
                        }}
                      >
                        {ShowNavPanel ? "⌄" : "⌄"}
                      </span>
                    </div>

                    {/* Expandable content */}
                    <div
                      style={{
                        transition: "max-height 0.4s ease, opacity 0.4s ease",
                        overflow: "hidden",
                        maxHeight: ShowNavPanel ? "1000px" : "0",
                        opacity: ShowNavPanel ? 1 : 0,
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
                        {AnswerList.map((item, idx) => {
                          const isCurrent =
                            CurrentQuestion?.id === item.questionId;
                          return (
                            <button
                              key={item.questionId}
                              onClick={async () => {
                                const res =
                                  await agent.UserPackage.checkQuestion(
                                    SessionId,
                                    item.questionId
                                  );
                                SetCurrentQuestion(res.data.question);
                                const matched = AnswerList.find(
                                  (a) => a.questionId === item.questionId
                                );
                                SetSelectedChoice(matched?.answer || null);

                                const index = AnswerList.findIndex(
                                  (a) => a.questionId === res.data.question.id
                                );
                                SetQuestionNumber(index + 1);
                              }}
                              style={{
                                padding: "0.5rem",
                                fontSize: "1.3rem",
                                borderRadius: "6px",
                                fontWeight: "600",
                                border: isCurrent
                                  ? "2px solid #004ba0"
                                  : "1px solid #ccc",
                                backgroundColor: item.answer
                                  ? "#8bc740"
                                  : "#f3f3f3",
                                color: isCurrent
                                  ? "#004ba0"
                                  : item.answer
                                  ? "white"
                                  : "#333",
                                cursor: "pointer",
                              }}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3>
                  Pada session ini , kamu punya 30 menit untuk menyelsaikan bank
                  soal, Silahkan klik "Go" untuk memulai waktu latihan
                </h3>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "5rem",
                  }}
                >
                  <button
                    className="button--go"
                    onClick={handleStart}
                    data-testid="button-go"
                  >
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
              Apakah <b>{store!.UserStore.UserProfile?.displayName}</b> yakin
              untuk menyelesaikan simulasi?
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
                onClick={() => setPopupConfirmationclass("popup__confirmation")}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default PackageTest;
