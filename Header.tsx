import { useState, useEffect } from "react";
import agent from "./app/api/agent";
import "./css/style2.css";
import "./css/header.css";
import { UserProfile } from "./app/model/UserProfile";

export default function Header() {
  const [hamburgerStatus, setHamburgerStatus] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showLogout, setShowLogout] = useState(false);

  function toggleHamburger() {
    setHamburgerStatus(!hamburgerStatus);
  }

  useEffect(() => {
    agent.Account.getUserProfile()
      .then((data) => {
        setUserProfile(data);
      })
      .catch(console.error);
    console.log(userProfile?.displayName);
  }, []);

  const handleLogout = () => {
    // Add logout logic here
    alert("Logged out");
  };

  return (
    <>
      <input
        type="checkbox"
        id="nav-toggle"
        checked={hamburgerStatus}
        onClick={toggleHamburger}
        className="layout__nav-checkbox"
      />
      <header className="layout__header">
        <label htmlFor="nav-toggle" className="layout__nav-button">
          <span className="layout__nav-icon">&nbsp;</span>
        </label>
        <div className="layout__nav-background">&nbsp;</div>
        <div className="layout__header-text">Ujan</div>

        <div
          className="user-profile-container"
          onMouseEnter={() => setShowLogout(true)}
          onMouseLeave={() => setShowLogout(false)}
        >
          <div className="user-avatar">
            <div className="user-initials">
              {userProfile?.displayName?.charAt(0).toUpperCase().toString() +
                "" +
                userProfile?.displayName?.charAt(1).toUpperCase().toString() ??
                "?"}
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
