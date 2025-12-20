import { useState, useEffect } from "react";
import agent from "./app/api/agent";
import "./css/style2.css";
import "./css/header.css";
import { UserProfile } from "./app/model/UserProfile";
import { store } from "./app/store/store";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("hamburgerState changed to:", store.CommonStore.hamburgerState);
  }, [store.CommonStore.hamburgerState]);

  useEffect(() => {
    if (userProfile) return;

    agent.Account.getUserProfile()
      .then((response) => {
        console.log(response.data);
        setUserProfile(response.data);
      })
      .catch(console.error);
  }, [userProfile]);

  const handleLogout = () => {
    agent.Account.logout()
      .then((response) => {
        console.log(response);
        localStorage.removeItem("user");
        localStorage.removeItem("ujanSessionId");
        localStorage.removeItem("ujanTestSessionId");
        store.CommonStore.setToken("");
        navigate("/");
      })
      .catch(console.error);

    // Add logout logic here
  };

  return (
    <>
      <input
        type="checkbox"
        id="nav-toggle"
        className="layout__nav-checkbox"
        defaultChecked={true} // ✅ default is unchecked
        onChange={() => store.CommonStore.setHamburgerState()}
      />
      <header className="layout__header">
        <label htmlFor="nav-toggle" className="layout__nav-button">
          <span className="layout__nav-icon">&nbsp;</span>
        </label>
        <div className="layout__nav-background">&nbsp;</div>
        <div className="layout__header-text">Ujan - Ujian Latihan</div>

        <div
          className="user-profile-container"
          onMouseEnter={() => setShowLogout(true)}
          onMouseLeave={() => setShowLogout(false)}
        >
          <div className="user-avatar">
            <div className="user-initials">
              {userProfile?.displayName?.charAt(0).toUpperCase().toString()}
            </div>
          </div>
          {showLogout && (
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </header>
    </>
  );
}
