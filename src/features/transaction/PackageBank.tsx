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
  const { startTest } = TestStore;

  const { listUserPackage, loadUserPackage } = QuestionStore;
  const popupRef = useRef<HTMLDivElement>(null);
  const [choosedId, setChoosedId] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadUserPackage();
  }, []);

  return (
    <>
      <div className="layout">
        <Header />
        <div className="layout__body">
          <NavLane />
          <main className="layout__main">
            <h1>Paket Belajar Ku..</h1>
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
                                setPopupConfirmationclass(
                                  "popup__confirmation-show"
                                );
                                setChoosedId(pkg.package_id);
                              } else {
                                navigate(
                                  `/PurchasePackage?package=${pkg.package_id}`
                                );
                              }
                            }}
                            className="btn btn--white"
                          >
                            Mulai Latihan →
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
        {/* Footer */}
        <footer className="layout__footer">&copy; ANE</footer>
        <div className={popupConfirmationClass}>
          <div
            className="popup__confirmation__overlay"
            onClick={() => setPopupConfirmationclass("popup__confirmation")}
          ></div>
          <div className="popup__confirmation__content fancy" ref={popupRef}>
            <h3 className="popup__confirmation__title">Submit Confirmation</h3>
            <p className="popup__confirmation__text">
              Yakin untuk mulai simulasi?
            </p>
            <div className="popup__confirmation__buttons">
              <button
                className="popup__confirmation__button popupConfirmation__button--yes"
                onClick={() => {
                  startTest();
                  navigate(`/PackageTest?for=${choosedId}`);
                }}
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
});
