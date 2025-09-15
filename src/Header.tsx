import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "./app/store/store";
import { useNavigate } from "react-router-dom";
import "./css/header.css";

export default observer(function Header() {
  const { CommonStore } = useStore();
  const navigate = useNavigate();

  const { userProfile, loadUserProfile, logout, setToken, setHamburgerState } =
    CommonStore;

  useEffect(() => {
    if (!userProfile) loadUserProfile();
  }, [userProfile, loadUserProfile]);

  const handleLogout = async () => {
    await logout();
    setToken("");
    navigate("/");
  };

  return (
    <>
      <input
        type="checkbox"
        id="nav-toggle"
        className="layout__nav-checkbox"
        defaultChecked={true}
        onChange={setHamburgerState}
      />
      <header className="layout__header">
        <label htmlFor="nav-toggle" className="layout__nav-button">
          <span className="layout__nav-icon">&nbsp;</span>
        </label>
        <div className="layout__header-text">Ujan - Ujian Latihan</div>
        <div className="user-profile-container">
          <div className="user-avatar">
            <div className="user-initials">
              {userProfile?.displayName?.charAt(0).toUpperCase()}
            </div>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
    </>
  );
});
