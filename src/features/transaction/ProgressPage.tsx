import "../../css/style2.css";
import "../../css/ProgressPage.css";
import { useEffect, useState } from "react";
import NavLane from "../../NavLane";
import Header from "../../Header";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../app/store/store";
import { observer } from "mobx-react-lite";
import ScoreSparkline from "../component/ScoreSparkline";
import { TestHistoryItem } from "../../app/model/ListProgressSummary";

export default observer(function ProgressPage() {
  const { ProgressStore } = useStore();
  const {
    summary,
    recentTests,
    learningPlan,
    isLoading,
    loadProgress,
    testHistory,
  } = ProgressStore;

  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Group by month
  const grouped = groupByMonth(
    testHistory.filter((test) =>
      test.subtestName.toLowerCase().includes(searchText.toLowerCase())
    )
  );

  useEffect(() => {
    loadProgress();
  }, []);

  function groupByMonth(history: TestHistoryItem[]) {
    const groups: Record<string, TestHistoryItem[]> = {};

    history.forEach((item) => {
      const d = new Date(item.date);
      const key = d.toLocaleString("id-ID", { month: "long", year: "numeric" });

      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    return groups;
  }

  function getScoreClass(score: number) {
    if (score >= 85) return "score-badge score-high";
    if (score >= 70) return "score-badge score-medium";
    return "score-badge score-low";
  }

  return (
    <div className="layout">
      <Header />
      <div className="layout__body">
        <NavLane />
        <main className="layout__main">
          <div className="progress-page">
            {/* Title */}
            <div className="progress-page__header">
              <h2 className="heading-secondary">Perkembangan Belajar Kamu</h2>
              <p className="progress-page__subtitle">
                Lihat riwayat ujian dan langkah kecil berikutnya.
              </p>
            </div>
            {/* Summary Card */}
            <section className="progress-summary">
              <h3 className="progress-summary__title">🎯 Ringkasan</h3>
              {summary ? (
                <div className="progress-summary__content">
                  <div className="progress-summary__item">
                    <span className="progress-summary__label">Tes selesai</span>
                    <span className="progress-summary__value">
                      {summary.totalTests}
                    </span>
                  </div>
                  <div className="progress-summary__item">
                    <span className="progress-summary__label">
                      Nilai rata-rata
                    </span>
                    <span className="progress-summary__value">
                      {summary.averageScore}%
                    </span>
                  </div>
                  <div className="progress-summary__item">
                    <span className="progress-summary__label">
                      Nilai terbaik
                    </span>
                    <span className="progress-summary__value">
                      {summary.bestScore}%
                    </span>
                  </div>
                </div>
              ) : (
                <p className="progress-summary__empty">
                  Belum ada data ujian yang bisa ditampilkan.
                </p>
              )}
            </section>

            {/* Recent Tests */}
            <section className="progress-history">
              <h3 className="progress-history__title">
                📘 Riwayat Ujian Terakhir
              </h3>
              {isLoading ? (
                <p className="progress-history__loading">
                  Memuat riwayat ujian...
                </p>
              ) : recentTests.length === 0 ? (
                <p className="progress-history__empty">
                  Kamu belum mengerjakan ujian apapun.
                </p>
              ) : (
                <>
                  <ul className="progress-history__list">
                    {recentTests.map((test) => (
                      <li
                        key={test.id}
                        className="progress-history__item"
                        onClick={() =>
                          navigate(
                            `/PackageTest?fromHistory=true&subtest=${encodeURIComponent(
                              test.subtestName
                            )}`
                          )
                        }
                      >
                        <div className="progress-history__main">
                          <div className="progress-history__names">
                            <div className="progress-history__subtest">
                              {test.subtestName}
                            </div>
                            <div className="progress-history__package">
                              {test.packageName}
                            </div>
                          </div>
                          <div className="progress-history__score">
                            <span
                              className={`progress-history__score-badge progress-history__score-badge--${getScoreLevel(
                                test.score
                              )}`}
                            >
                              {test.score}%
                            </span>
                          </div>
                        </div>
                        <div className="progress-history__meta">
                          <span>{formatDate(test.date)}</span>
                          <span>·</span>
                          <span>{test.durationMinutes} menit</span>
                          <span className="progress-history__link">
                            Lihat rincian →
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {/* Sparkline */}
                  <div className="progress-chart-box">
                    <ScoreSparkline
                      scores={testHistory.map((t) => t.score)}
                      width={300}
                      height={70}
                    />
                  </div>
                </>
              )}
              <button
                className="btn-show-all"
                onClick={() => setShowModal(true)}
                style={{
                  marginTop: "1rem",
                  padding: "0.8rem 1.6rem",
                  borderRadius: "10px",
                  fontSize: "1.2rem",
                  background: "#e0f2fe",
                  border: "1px solid #38bdf8",
                  cursor: "pointer",
                }}
              >
                Tampilkan Semua Riwayat ({testHistory.length})
              </button>
            </section>

            {/* Learning Plan */}
            <section className="progress-plan">
              <h3 className="progress-plan__title">
                📝 Rencana Belajar Sederhana
              </h3>
              {learningPlan ? (
                <div className="progress-plan__card">
                  <p className="progress-plan__weak-label">
                    Area yang perlu diperkuat:
                  </p>
                  <p className="progress-plan__weak-area">
                    {learningPlan.weakArea}
                  </p>

                  <p className="progress-plan__next-label">
                    Langkah berikutnya:
                  </p>
                  <p className="progress-plan__suggested">
                    {learningPlan.suggestedTestName}
                  </p>

                  <p className="progress-plan__note">{learningPlan.note}</p>

                  <button
                    className="progress-plan__button"
                    onClick={() =>
                      navigate(
                        `/PackageTest?plan=true&subtest=${encodeURIComponent(
                          learningPlan.suggestedTestName
                        )}`
                      )
                    }
                  >
                    Mulai Latihan Ini
                  </button>
                </div>
              ) : (
                <p className="progress-plan__empty">
                  Kerjakan beberapa ujian dulu, lalu kami bantu buat rencana
                  belajarnya. 💪
                </p>
              )}
            </section>
          </div>
        </main>
      </div>
      <footer className="layout__footer">&copy; ANE</footer>
      {showModal && (
        <div className="history-modal-overlay">
          <div className="history-modal">
            {/* Sticky Close Button */}
            <button
              className="history-close-btn"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>

            <h3 style={{ marginBottom: "0.5rem" }}>Semua Riwayat Ujian</h3>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Cari subtest..."
              className="history-search-input"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            {/* Grouped by Month */}
            {Object.keys(grouped).length === 0 ? (
              <p style={{ marginTop: "1rem", color: "#777" }}>
                Tidak ada hasil untuk "{searchText}"
              </p>
            ) : (
              Object.keys(grouped).map((month) => (
                <div key={month}>
                  <div className="month-title">{month}</div>

                  {grouped[month].map((test) => (
                    <div
                      key={test.id}
                      className="history-item"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        navigate(
                          `/PackageTest?fromHistory=true&subtest=${encodeURIComponent(
                            test.subtestName
                          )}`
                        )
                      }
                    >
                      <div className="history-left">
                        <div className="history-subtest">
                          {test.subtestName}
                        </div>
                        <div className="history-meta">
                          {test.durationMinutes} menit · {formatDate(test.date)}
                        </div>
                      </div>

                      <span className={getScoreClass(test.score)}>
                        {test.score}%
                      </span>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
});

// Simple helpers – can move to utils file
function getScoreLevel(score: number): "low" | "medium" | "high" {
  if (score >= 85) return "high";
  if (score >= 70) return "medium";
  return "low";
}

function formatDate(dateStr: string): string {
  // Very simple; later you can use dayjs/luxon if needed
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
