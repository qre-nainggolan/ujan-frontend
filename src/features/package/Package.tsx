import "../../css/style2.css";
import "../../css/card.css";

import NavLane from "../../NavLane";
import Header from "../../Header";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useStore } from "../../app/store/store";
import { observer } from "mobx-react-lite";
import Footer from "../../Footer";

export default observer(function QuestionGrid() {
  const { PackageStore, TestStore } = useStore();
  const [popupConfirmationClass, setPopupConfirmationclass] = useState(
    "popup__confirmation"
  );
  const [choosedId, setChoosedId] = useState("");
  const popupRef = useRef<HTMLDivElement>(null);
  const pos = useRef({
    x: 0,
    y: 0,
    startX: 0,
    startY: 0,
    dragging: false,
  });
  const { listAvailablePackage, loadAvailablePackage } = PackageStore;

  const { startTest } = TestStore;

  const navigate = useNavigate();

  useEffect(() => {
    loadAvailablePackage();
  }, []);

  return (
    <div className="layout">
      <Header />
      <div className="layout__body">
        <NavLane />
        <main className="layout__main">
          <h1>Packets</h1>
          <div className="u-center-text u-margin-bottom-medium">
            <h2 className="heading-secondary">
              Latihan dengan semakin baik...
            </h2>
          </div>
          <div className="row2">
            {listAvailablePackage.map((pkg: any, index: any) => (
              <div className="card-wrapper" key={pkg.id}>
                <div className="card">
                  <div className="card__side card__side--front">
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
                        {pkg.description
                          .split(". ")
                          .map((item: any, i: any) => (
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
                        {pkg.is_purchased ? (
                          <>
                            <p className="card__price-only">Sudah Dibeli</p>
                            <p className="card__price-value">Akses Penuh</p>
                          </>
                        ) : (
                          <>
                            <p className="card__price-only">
                              Diskon {pkg.discount}% hingga{" "}
                              {new Date(pkg.end_date).toLocaleDateString()}
                            </p>
                            <p className="card__price-value">
                              Rp {pkg.final_price.toLocaleString()}
                            </p>
                          </>
                        )}
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
                        {pkg.is_purchased
                          ? "Mulai Latihan →"
                          : "Beli Sekarang →"}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
  );
});
