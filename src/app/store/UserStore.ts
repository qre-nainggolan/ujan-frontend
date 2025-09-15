import { makeAutoObservable, runInAction } from "mobx";
import { UserProfile } from "../model/UserProfile";
import { User } from "../model/user";
import { store } from "./store";
import { ListUser } from "../model/ListUser";
import { ListUserScore } from "../model/ListUserScore";
import agent from "../api/agent";

export default class UserStore {
  user: User | null = null;
  listUser: ListUser[] = [];
  listUserScore: ListUserScore[] = [];
  loadingInitial = false;
  keyword = "";
  status = "";
  loginStatus = false;
  aim = "";
  userId = "";
  dateTime = "";
  UserProfile: UserProfile | null = null;

  detail: UserProfile = {
    nama_User: "",
    userID: "",
    registering: "",
    fingerprint: "",
    expired_Password: "",
    approval_Notes: "",
    lastChange: "",
    password: "",
    user_Profile: ""!,
    retypePassword: "",
    status: "",
    displayName: "",
  };

  currentPage = 1;
  totalPages = 1;
  totalData = 0;
  pageSize = 50;

  constructor() {
    makeAutoObservable(this);
  }

  setPageSize = (size: number) => {
    this.pageSize = size;
  };

  logout = () => {
    store.CommonStore.setToken(null);
    window.localStorage.removeItem("user");
    this.UserProfile = null;
    this.setLoginStatus(false);
  };

  getUserProfile = async () => {
    this.loadingInitial = true;
    try {
      await agent.Account.getUserProfile().then((response) => {
        this.UserProfile = response.data;
      });
      this.loadingInitial = false;

      return this.UserProfile;
    } catch (error) {
      this.loadingInitial = false;
    }
  };

  loadUserScore = async (_keyword: string, pageNumber_ = 1) => {
    try {
      const result = await agent.Score.getScoreSummary(
        _keyword,
        pageNumber_,
        this.pageSize
      );
      const data = Array.isArray(result?.data) ? result.data : [];

      runInAction(() => {
        this.listUserScore = data;
      });
    } catch (e) {
      console.error("loadUserScore error:", e);
      runInAction(() => {
        this.listUserScore = []; // keep it an array
      });
    }
  };

  get loadUserParams() {
    const params = new URLSearchParams();
    params.append("keyword", this.keyword);
    params.append("status", this.status);
    params.append("aim", this.aim);
    params.append("userId", this.userId);
    return params;
  }

  setLoadingInitial = (state: boolean) => {
    this.loadingInitial = state;
  };

  setLoginStatus = (state: boolean) => {
    this.loginStatus = state;
  };
}
