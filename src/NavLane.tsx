import Icons from "./img/sprite.svg"; // Path to your icons.svg
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "./app/store/store";

// const NavLane = observer(() => {
export default observer(function NavLane() {
  const navigate = useNavigate();
  const { CommonStore } = useStore();
  const { hamburgerState, setHamburgerState, setNavLaneWidth, userProfile } =
    CommonStore;

  // ref to the nav element
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!navRef) return;
    if (!navRef.current) return; // <-- eliminate null warning

    if (hamburgerState === false) {
      requestAnimationFrame(() => {
        setNavLaneWidth(100);
      });
    } else {
      setNavLaneWidth(100);
    }
  }, [hamburgerState]);

  function directPage(target: string) {
    setHamburgerState();
    navigate(target);
  }

  return (
    <nav
      ref={navRef}
      className={`layout__nav-lane ${!hamburgerState ? "active" : ""}`}
    >
      <ul className="nav-menu">
        <li>
          <a
            href="#"
            className="nav-link"
            onClick={() => {
              directPage("/MainPage");
            }}
          >
            <svg className="menu-icon">
              <use xlinkHref={`${Icons}#icon-home`}></use>
            </svg>
            <span className="menu-text">Dashboard</span>
          </a>
        </li>
        <li>
          <a href="#" className="nav-link">
            <svg className="menu-icon">
              <use xlinkHref={`${Icons}#icon-stats-dots`}></use>
            </svg>
            <span className="menu-text">Visual Data</span>
          </a>
          <ul>
            <li>
              <a
                href="#"
                onClick={() => {
                  directPage("/PackageBank");
                }}
              >
                Paket Saya
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={() => {
                  directPage("/ProgressPage");
                }}
              >
                Perkembangan
              </a>
            </li>
          </ul>
        </li>
        <li>
          <a href="#" className="nav-link">
            <svg className="menu-icon">
              <use xlinkHref={`${Icons}#icon-stack`}></use>
            </svg>
            <span className="menu-text">Data Collection</span>
          </a>
          <ul>
            <li>
              <a
                href="#"
                onClick={() => {
                  directPage("/Tryout");
                }}
              >
                Simulasi-Gratis⭐
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={() => {
                  directPage("/Package");
                }}
              >
                Pilihan Paket
              </a>
            </li>
          </ul>
        </li>
        {userProfile?.userType === "root" && (
          <li>
            <a href="#" className="nav-link">
              <svg className="menu-icon">
                <use xlinkHref={`${Icons}#icon-cog`}></use>
              </svg>
              <span className="menu-text">Kelola System</span>
            </a>
            <ul>
              <li>
                <a href="#">System</a>
                <ul>
                  <li>
                    <a
                      href="#"
                      onClick={() => {
                        directPage("/PackageGrid");
                      }}
                    >
                      Jenis Paket
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      onClick={() => {
                        directPage("/MapDrone");
                      }}
                    >
                      Restore
                    </a>
                  </li>
                </ul>
              </li>
              <li>
                <a
                  href="#"
                  onClick={() => {
                    directPage("/QuestionGrid");
                  }}
                >
                  Daftar Soal
                </a>
              </li>
            </ul>
          </li>
        )}
      </ul>
    </nav>
  );
});
