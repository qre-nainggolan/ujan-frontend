import { useEffect } from "react";
import "../css/style.css";

import logo from "../img/logo.png";
import about1 from "../img/about-1.webp";
import about1large from "../img/about-1-large.webp";
import about2 from "../img/about-2.webp";
import about2large from "../img/about-2-large.webp";
import about3 from "../img/about-3.webp";
import about3large from "../img/about-3-large.webp";

import { useStore } from "../app/store/store";
import { Formik } from "formik";

import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

export default observer(function PublicPage() {
  const { CommonStore, AuthenticationStore } = useStore();
  const { userProfile, loadUserProfile, setToken } = CommonStore;
  const {
    login,
    userLoginValue,
    setLoginValue,
    registrationValue,
    confirmPassword,
    setConfirmPassword,
    setRegistrationValue,
    register,
  } = AuthenticationStore;

  const navigate = useNavigate();

  useEffect(() => {
    if (import.meta.hot) {
      import.meta.hot.dispose(() => {
        console.log("HMR updating, preventing login request.");
      });
    }

    if (!userProfile) loadUserProfile();
  }, [userProfile]);

  const handleLogin = async () => {
    const user = await login();
    if (user?.token && user.token !== "NoUser") {
      sessionStorage.setItem("user", JSON.stringify(user));
      setToken(user.token);
      await loadUserProfile();
      console.log("Tester");
      navigate("/MainPage");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  function toggleNavigation() {
    const checkbox_ = document.getElementById(
      "navi-toggle"
    ) as HTMLInputElement;
    checkbox_.checked = false;
  }

  return (
    <>
      <div className="navigation">
        <input
          type="checkbox"
          className="navigation__checkbox"
          id="navi-toggle"
        />
        <label htmlFor="navi-toggle" className="navigation__button">
          <span className="navigation__icon">&nbsp;</span>
        </label>
        <div className="navigation__background">&nbsp;</div>
        <nav className="navigation__nav">
          <ul className="navigation__list">
            <li className="navigation__item">
              <a
                href="#section-header"
                className="navigation__link"
                onClick={toggleNavigation}
              >
                <span>&nbsp;</span>Go to Top
              </a>
            </li>
            <li className="navigation__item">
              <a
                href="#section-about"
                className="navigation__link"
                onClick={toggleNavigation}
              >
                <span>01</span>Tentang Ujan (Ujian Online)
              </a>
            </li>
            <li className="navigation__item">
              <a
                href="#section-main"
                className="navigation__link"
                onClick={toggleNavigation}
              >
                <span>02</span>Login & Mulai
              </a>
            </li>
            <li className="navigation__item">
              <a
                href="#section-learning-packages"
                className="navigation__link"
                onClick={toggleNavigation}
              >
                <span>03</span>Trending Ujian & Latihan
              </a>
            </li>
            <li className="navigation__item">
              <a
                href="#"
                className="navigation__link"
                onClick={toggleNavigation}
              >
                <span>04</span>Testimoni
              </a>
            </li>
            <li className="navigation__item">
              <a
                href="section-main"
                className="navigation__link"
                onClick={toggleNavigation}
              >
                <span>05</span>Hubungi Kami...
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <header className="header" id="section-header"></header>
      <div className="header__logo-box">
        <img src={logo} alt="Company Logo" />
      </div>
      <div className="header__text-box">
        <h1 className="heading-primary">
          <span className="heading-primary--main">Ujan</span>
          <span className="heading-primary--sub">Raih Skor Impianmu</span>
        </h1>
        <a
          href="#section-learning-packages"
          className="btn btn--white btn--animated"
        >
          <b>Coba Free &rarr;</b>
        </a>
      </div>
      <main>
        <section className="section-about" id="section-about">
          <div className="u-center-text u-margin-bottom-medium">
            <h2 className="heading-secondary">
              Inovasi dalam Persiapan CPNS/ASN
            </h2>
          </div>
          <div className="row">
            <div className="col-1-of-2">
              <h3 className="heading-tertiary u-margin-bottom-small">
                Mengasah Kemampuan
              </h3>
              <p className="paragraph">
                Dengan berbagai soal ioT yang mencakup beragam mata pelajaran,
                siswa dapat mengasah kemampuan analisis, pemecahan masalah, dan
                pemahaman konsep secara mendalam
              </p>
              <h3 className="heading-tertiary u-margin-bottom-small">
                Meningkatkan Kepercayaan Diri
              </h3>
              <p className="paragraph">
                Ujian & Latihan soal secara rutin memungkinkan siswa untuk
                mengenali pola soal, mempelajari strategi pengerjaan yang
                efektif, dan mengurangi kecemasan menghadapi ujian sesungguhnya
              </p>
              <h3 className="heading-tertiary u-margin-bottom-small">
                Evaluasi Mandiri & Dari Para Ahli
              </h3>
              <p className="paragraph">
                Ujian online ini memberikan feedback langsung, sehingga siswa
                dapat mengetahui area yang perlu ditingkatkan dan memantau
                perkembangan belajar mereka secara berkala.
              </p>

              <a href="#" className="btn-text">
                Lihat Lebih Lanjut&rarr;
              </a>
            </div>
            <div className="col-1-of-2">
              <div className="composition">
                <img
                  srcSet={`${about1} 300w, ${about1large} 1000w`}
                  sizes="(max-width:56.25em) 20vh, (max-width:37.5em) 30vh, 300px"
                  className="composition__photo composition__photo--p1"
                  src={about1large}
                  alt="Photo 1"
                />

                <img
                  srcSet={`${about2} 300w, ${about2large} 1000w`}
                  sizes="(max-width:56.25em) 20vh, (max-width:37.5em) 30vh, 300px"
                  className="composition__photo composition__photo--p2"
                  src={about2large}
                  alt="Photo 2"
                />

                <img
                  srcSet={`${about3} 300w, ${about3large} 1000w`}
                  sizes="(max-width:56.25em) 20vh, (max-width:37.5em) 30vh, 300px"
                  className="composition__photo composition__photo--p3"
                  src={about3large}
                  alt="Photo 3"
                />
              </div>
            </div>
          </div>
        </section>
        <section id="section-main" className="section-main">
          <div className="row">
            <div className="book">
              <div className="book__form">
                <div className="u-margin-bottom-medium">
                  <h2 className="heading-secondary">Masukan Detail Login</h2>
                  <br />
                </div>
                <div className="form__group">
                  <input
                    type="email"
                    className="form__input"
                    placeholder="Email"
                    id="email"
                    onKeyDown={handleKeyDown}
                    value={userLoginValue.email}
                    onChange={(e) => setLoginValue("email", e.target.value)}
                    required
                  />
                  <label htmlFor="email" className="form__label">
                    Email
                  </label>
                </div>
                <div className="form__group">
                  <input
                    type="password"
                    className="form__input"
                    placeholder="Password"
                    id="name"
                    onKeyDown={handleKeyDown}
                    required
                    value={userLoginValue.password}
                    onChange={(e) => setLoginValue("password", e.target.value)}
                  />
                  <label htmlFor="name" className="form__label">
                    Password
                  </label>
                </div>
                <div className="form__group">
                  <button
                    className="btn btn--green"
                    onClick={() => {
                      handleLogin();
                    }}
                  >
                    Login &rarr;
                  </button>
                </div>
                <div className="form__group">
                  <a
                    href="#popup-new-account-registration"
                    className="btn btn--green"
                    id="CreateAccountHref"
                  >
                    Buat Akun &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className="section-learning-packages"
          id="section-learning-packages"
        >
          <div className="u-center-text u-margin-bottom-medium">
            <h2 className="heading-secondary">
              Ujian & Latihan Dimana Saja Dengan Gratis
            </h2>
          </div>

          <div className="row">
            <div className="col-1-of-3">
              <div className="card">
                <div className="card__side card__side--front">
                  <div className="card__picture card__picture--1">&nbsp;</div>
                  <h4 className="card__heading">
                    <span className="card__heading-span card__heading-span--1">
                      Test Kompetensi Dasar
                    </span>
                  </h4>
                  <div className="card__details">
                    <ul>
                      <li>Mengukur Kemampuan Dasar</li>
                      <li>Penilaian Berbasis SKD</li>
                      <li>100 soal dalam 100 menit</li>
                      <li>Tips & Strategi</li>
                      <li>Simulasi Tryout TKD</li>
                    </ul>
                  </div>
                </div>
                <div className="card__side card__side--back card__side--back-1">
                  <div className="card__cta">
                    <div className="card__price-box">
                      <p className="card__price-only">Mencoba Selama 7 Hari</p>
                      <p className="card__price-value">Gratis</p>
                    </div>
                    <a href="/test?for=TKD" className="btn btn--white">
                      Coba Sekarang &rarr;
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-1-of-3">
              <div className="card">
                <div className="card__side card__side--front">
                  <div className="card__picture card__picture--2">&nbsp;</div>
                  <h4 className="card__heading">
                    <span className="card__heading-span card__heading-span--1">
                      Test Wawasan Kebangsaan
                    </span>
                  </h4>
                  <div className="card__details">
                    <ul>
                      <li>Implementasi Pancasila & UUD 45</li>
                      <li>NKRI & Pemerintahan</li>
                      <li>Sejarah & Kebangsaan</li>
                      <li>Keberagaman & Toleransi</li>
                      <li>Simulasi Tryout TWK</li>
                    </ul>
                  </div>
                </div>
                <div className="card__side card__side--back card__side--back-1">
                  <div className="card__cta">
                    <div className="card__price-box">
                      <p className="card__price-only">Mencoba Selama 7 Hari</p>
                      <p className="card__price-value">Gratis</p>
                    </div>
                    <a href="/test?for=TWK" className="btn btn--white">
                      Coba Sekarang &rarr;
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-1-of-3">
              <div className="card">
                <div className="card__side card__side--front">
                  <div className="card__picture card__picture--3">&nbsp;</div>
                  <h4 className="card__heading">
                    <span className="card__heading-span card__heading-span--1">
                      Test Intelegensi Umum
                    </span>
                  </h4>
                  <div className="card__details">
                    <ul>
                      <li>Kemampuan Numerik</li>
                      <li>Penalaran Logis</li>
                      <li>Kemampuan Verbal</li>
                      <li>Analisis Data & Pola</li>
                      <li>Simulasi Tryout TIU</li>
                    </ul>
                  </div>
                </div>
                <div className="card__side card__side--back card__side--back-1">
                  <div className="card__cta">
                    <div className="card__price-box">
                      <p className="card__price-only">Mencoba Selama 7 Hari</p>
                      <p className="card__price-value">Gratis</p>
                    </div>
                    <a href="/test?for=TIU" className="btn btn--white">
                      Coba Sekarang &rarr;
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="u-center-text u-margin-top-big">
            <a href="" className="btn btn--green">
              Temukan Semua Paket Ujian & Latihan
            </a>
          </div>
        </section>
      </main>
      <div className="popup-account" id="popup-new-account-registration">
        <div className="popup-account__content">
          <div className="popup-account__full">
            <a href="#section-tours" className="popup-account__close">
              &times;
            </a>
            <h2 className="heading-secondary-registration u-margin-bottom-small">
              Daftar dan mulai perjalanan menuju CPNS impian!
            </h2>
            <h2 className="heading-tertiary u-margin-bottom-small">
              85% peserta CPNS yang berlatih secara rutin memiliki peluang lebih
              besar untuk lolos
            </h2>
            <div className="registration">
              <div className="registration__form">
                <div className="u-margin-bottom-small">
                  <h2 className="heading-secondary">Lengkapi Akun</h2>
                </div>
                <Formik
                  initialValues={registrationValue}
                  enableReinitialize
                  onSubmit={() => register()}
                >
                  {() => (
                    <>
                      <div className="form__group">
                        <input
                          type="text"
                          className="form__input__account"
                          placeholder="Username"
                          id="username"
                          value={registrationValue.username}
                          onChange={(e) =>
                            setRegistrationValue("username", e.target.value)
                          }
                          required
                        />
                        <label htmlFor="email" className="form__label">
                          Username
                        </label>
                      </div>
                      <div className="form__group">
                        <input
                          type="email"
                          className="form__input__account"
                          placeholder="Email"
                          id="nama"
                          value={registrationValue.email}
                          onChange={(e) =>
                            setRegistrationValue("email", e.target.value)
                          }
                          required
                        />
                        <label htmlFor="email" className="form__label">
                          Email
                        </label>
                      </div>
                      <div className="form__group">
                        <input
                          type="password"
                          className="form__input__account"
                          placeholder="Password"
                          id="password"
                          required
                          value={registrationValue.password}
                          onChange={(e) =>
                            setRegistrationValue("password", e.target.value)
                          }
                        />
                        <label htmlFor="name" className="form__label">
                          Password
                        </label>
                      </div>
                      <div className="form__group">
                        <input
                          type="password"
                          className="form__input__account"
                          placeholder="Ulangi Password"
                          id="retypePassword"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <label htmlFor="name" className="form__label">
                          Ulangi Password
                        </label>
                      </div>
                      <div className="form__group">
                        <input
                          type="text"
                          className="form__input__account"
                          placeholder="Instansi yang akan/sedang dilamar"
                          id="appliedInstance"
                          value={registrationValue.appliedInstance}
                          onChange={(e) =>
                            setRegistrationValue(
                              "appliedInstance",
                              e.target.value
                            )
                          }
                          required
                        />
                        <label
                          htmlFor="appliedInstance"
                          className="form__label"
                        >
                          Instansi yang akan/sedang dilamar
                        </label>
                      </div>
                      <div className="form__group">
                        <button
                          className="btn btn--green"
                          onClick={() => {
                            register();
                          }}
                        >
                          Kirim &rarr;
                        </button>
                      </div>
                    </>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
