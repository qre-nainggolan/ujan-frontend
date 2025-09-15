// app/store/AuthStore.ts
import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { LoginInterface } from "../model/LoginInterface";
import { RegistrationDataSubmissionValue } from "../model/RegistrationDataSubmission";

export default class AuthenticationStore {
  userLoginValue: LoginInterface = { username: "", email: "", password: "" };
  registrationValue = new RegistrationDataSubmissionValue();
  confirmPassword = "";
  loading = false;

  constructor() {
    makeAutoObservable(this);
  }

  setLoginValue = <P extends keyof LoginInterface>(
    prop: P,
    value: LoginInterface[P]
  ) => {
    this.userLoginValue = { ...this.userLoginValue, [prop]: value };
  };
  setRegistrationValue<P extends keyof RegistrationDataSubmissionValue>(
    prop: P,
    value: RegistrationDataSubmissionValue[P]
  ) {
    this.registrationValue = { ...this.registrationValue, [prop]: value };
  }

  setConfirmPassword = (value: string) => {
    this.confirmPassword = value;
  };

  login = async () => {
    this.loading = true;
    try {
      const user = await agent.Account.login(this.userLoginValue);
      runInAction(() => (this.loading = false));
      return user;
    } catch (err) {
      runInAction(() => (this.loading = false));
      throw err;
    }
  };

  register = async () => {
    this.loading = true;
    try {
      const res = await agent.Account.submitRegistration(
        this.registrationValue
      );
      runInAction(() => (this.loading = false));
      return res;
    } catch (err) {
      runInAction(() => (this.loading = false));
      throw err;
    }
  };
}
