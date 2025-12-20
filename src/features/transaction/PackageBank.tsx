import "../../css/style2.css";
import "../../css/card.css";
import { useState, useEffect, useRef } from "react";
import NavLane from "../../NavLane";
import Header from "../../Header";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../app/store/store";
import { observer } from "mobx-react-lite";

export default observer(function PackageBank() {
  const [popupConfirmationClass, setPopupConfirmationclass] = useState(
    "popup__confirmation"
  );

  const { QuestionStore, TestStore } = useStore();
  const {
    startTest,
    isStarted,
    packageId,
    isLoadingSubtest,
    subtestList,
    loadSubtest,
    selectedSubtest,
    sessionId,
    setSelectedSubtest,
    setPackageId,
    initTest,
  } = TestStore;

  const { listUserPackage, loadUserPackage } = QuestionStore;
  const popupRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  // Search filter
  const [filterText, setFilterText] = useState("");

  // Animate popup
  const [animClass, setAnimClass] = useState("popup__content--hidden");

  // Highlight match
  function highlight(text: string, keyword: string) {
    if (!keyword) return text;

    const regex = new RegExp(`(${keyword})`, "gi");
    return text.replace(regex, `<mark class="hi">$1</mark>`);
  }

  // Group subtests by category
  const groupedSubtests = subtestList.reduce((acc, item) => {
    const category = item.category || "Lainnya";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  useEffect(() => {
    loadUserPackage();
    initTest();
  }, []);

  useEffect(() => {
    if (isStarted && sessionId) {
      navigate(`/PackageTest?for=${packageId}&sub=${selectedSubtest}`);
    }
  }, [isStarted, sessionId]);

  return (
    <>
      <div className="layout">
        <Header />
        <div className="layout__body">
          <NavLane />
          <main className="layout__main">
            <div className="u-center-text u-margin-bottom-medium">
              <h2 className="heading-secondary">
                Ujian & Latihan Dimana Saja Dengan Gratis
              </h2>
            </div>
            {listUserPackage.length === 0 ? (
              <div className="u-center-text u-margin-top-large">
                <img
                  src="/images/empty-state.svg"
                  alt="No packages"
                  style={{ maxWidth: "200px", marginBottom: "1rem" }}
                />
                <p style={{ fontSize: "1.2rem", color: "#777" }}>
                  Belum ada paket yang tersedia untuk Anda.
                </p>
              </div>
            ) : (
              <div className="row2">
                {listUserPackage.map((pkg, index) => (
                  <div className="card-wrapper" key={pkg.id}>
                    <div className="card">
                      <div className={`card__side card__side--front`}>
                        <div
                          className={`card__picture card__picture--${
                            (index % 3) + 1
                          }`}
                        >
                          &nbsp;
                        </div>
                        <h4 className="card__heading">
                          <span
                            className={`card__heading-span card__heading-span--${
                              (index % 3) + 1
                            }`}
                          >
                            {pkg.name}
                          </span>
                        </h4>
                        <div className="card__details">
                          <ul>
                            {pkg.description.split(". ").map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div
                        className={`card__side card__side--back card__side--back-${
                          (index % 3) + 1
                        }`}
                      >
                        <div className="card__cta">
                          <div className="card__price-box">
                            <p className="card__price-only">Sudah Dibeli</p>
                            <p className="card__price-value">Akses Penuh</p>
                          </div>
                          <a
                            href="#"
                            onClick={() => {
                              if (pkg.is_purchased) {
                                loadSubtest(pkg.package_id);
                                setPopupConfirmationclass(
                                  "popup__confirmation-show"
                                );
                                setPackageId(pkg.package_id);
                              } else {
                                navigate(
                                  `/PurchasePackage?package=${pkg.package_id}`
                                );
                              }
                            }}
                            style={{ fontWeight: 200 }}
                            className="btn btn--white"
                          >
                            Mulai
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
        <footer className="layout__footer">&copy; ANE</footer>
        <div className={popupConfirmationClass}>
          <div
            className="popup__confirmation__overlay"
            onClick={() => {
              setAnimClass("popup__content--hidden");
              setTimeout(
                () => setPopupConfirmationclass("popup__confirmation"),
                200
              );
              setSelectedSubtest("");
            }}
          ></div>
          <div
            className={`popup__confirmation__content fancy ${animClass}`}
            ref={popupRef}
          >
            <h3 className="popup__confirmation__title">Pilih Kategori Test</h3>
            <div className="popup__filter-box">
              <input
                type="text"
                placeholder="Cari subtest..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="popup__filter-input"
              />
            </div>
            {isLoadingSubtest ? (
              <p>Loading subtest...</p>
            ) : (
              <div className="subtest-list">
                {Object.keys(groupedSubtests).map((category) => {
                  const items = groupedSubtests[category].filter(
                    (s: any) =>
                      s.section
                        .toLowerCase()
                        .includes(filterText.toLowerCase()) ||
                      (s.packageName || "")
                        .toLowerCase()
                        .includes(filterText.toLowerCase())
                  );

                  if (items.length === 0) return null;

                  return (
                    <div key={category} className="subtest-category">
                      <h4 className="category-title">{category}</h4>
                      <div className="subtest-wrapper">
                        {items.map((s: any, index: number) => (
                          <div
                            key={index}
                            className={`subtest-item ${
                              selectedSubtest === s.section ? "selected" : ""
                            }`}
                            onClick={() => setSelectedSubtest(s.section)}
                          >
                            <div className="subtest-icon">📘</div>

                            <div className="subtest-text">
                              <div
                                className="subtest-title"
                                dangerouslySetInnerHTML={{
                                  __html: highlight(
                                    s.packageName || s.section,
                                    filterText
                                  ),
                                }}
                              ></div>

                              <div className="subtest-meta">
                                Total Soal: {s.total_questions}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="popup__confirmation__buttons">
              <button
                disabled={isLoadingSubtest || !selectedSubtest}
                className={`popup__confirmation__button popup__confirmation__button--yes ${
                  !selectedSubtest ? "disabled" : ""
                }`}
                style={{ fontSize: "1.5rem" }}
                onClick={async () => await startTest()}
              >
                {isLoadingSubtest ? "Loading..." : "Mulai"}
              </button>

              <button
                className="popup__confirmation__button popup__confirmation__button--cancel"
                style={{ fontSize: "1.5rem" }}
                onClick={() => {
                  setAnimClass("popup__content--hidden");
                  setTimeout(
                    () => setPopupConfirmationclass("popup__confirmation"),
                    200
                  );
                  setSelectedSubtest("");
                }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
