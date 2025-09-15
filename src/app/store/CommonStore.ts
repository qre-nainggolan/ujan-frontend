import { makeAutoObservable, reaction, runInAction } from "mobx";
import { ServerError } from "../model/ServerError";
import agent from "../api/agent";
import { UserProfile } from "../model/UserProfile";

export default class CommonStore {
  error: ServerError | null = null;
  token: string | null = window.localStorage.getItem("userToken");
  appLoaded = false;
  hamburgerState = true;
  userProfile: UserProfile | null = null;
  loadingProfile = false;

  constructor() {
    makeAutoObservable(this);

    reaction(
      () => this.token,
      (token) => {
        if (token) {
          window.localStorage.setItem("userToken", token);
        } else {
          window.localStorage.removeItem("userToken");
        }
      }
    );
  }

  setHamburgerState = () => {
    this.hamburgerState = !this.hamburgerState;
  };

  setServerError = (error: ServerError) => {
    this.error = error;
  };

  setToken = (token: string | null) => {
    this.token = token;
  };

  setAppLoaded = () => {
    this.appLoaded = true;
  };

  loadUserProfile = async () => {
    this.loadingProfile = true;
    try {
      const response = await agent.Account.getUserProfile();
      runInAction(() => {
        this.userProfile = response.data;
      });
    } finally {
      runInAction(() => {
        this.loadingProfile = false;
      });
    }
  };

  logout = async () => {
    await agent.Account.logout(localStorage.getItem("ujanSessionId")!);
    runInAction(() => {
      this.userProfile = null;
    });
    localStorage.removeItem("user");
    localStorage.removeItem("ujanSessionId");
    localStorage.removeItem("ujanTestSessionId");
  };
}
