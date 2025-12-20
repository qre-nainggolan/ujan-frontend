// app/store/AuthStore.ts
import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { LoginInterface } from "../model/LoginInterface";
import { RegistrationDataSubmissionValue } from "../model/RegistrationDataSubmission";

export default class AuthenticationStore {
  userLoginValue: LoginInterface = { username: "", email: "", password: "" };

  registrationValue = {
    username: "",
    email: "",
    password: "",
    appliedInstance: "",
    appliedInstanceOther: "",
    province: "",
    city: "",
    emailConfirmed: "",
    dateCreate: "",
    userStatus: "",
  };
  confirmPassword = "";
  loading = false;

  successMessage: string = "";
  errorMessage: string = "";

  setSuccess = (msg: string) => {
    this.successMessage = msg;
    this.errorMessage = "";
  };

  setError = (msg: string) => {
    this.errorMessage = msg;
    this.successMessage = "";
  };

  clearMessages = () => {
    this.successMessage = "";
    this.errorMessage = "";
  };

  constructor() {
    makeAutoObservable(this);
  }

  // app/store/AuthStore.ts

  register = async () => {
    this.loading = true;
    try {
      const res = await agent.Account.submitRegistration(
        this.registrationValue
      );
      runInAction(() => {
        this.loading = false;
        this.setSuccess("Pendaftaran berhasil! Silakan login.");

        this.registrationValue = new RegistrationDataSubmissionValue();
        this.confirmPassword = "";
      });
      return res;
    } catch (err: any) {
      runInAction(() => {
        this.loading = false;
        console.log(err);
        this.setError(err?.response?.data?.error || "Registrasi gagal.");
      });
      throw err;
    }
  };

  setLoginValue = <P extends keyof LoginInterface>(
    prop: P,
    value: LoginInterface[P]
  ) => {
    this.userLoginValue = { ...this.userLoginValue, [prop]: value };
  };
  setRegistrationValue = <P extends keyof typeof this.registrationValue>(
    prop: P,
    value: (typeof this.registrationValue)[P]
  ) => {
    this.registrationValue[prop] = value;
  };
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

  // register = async () => {
  //   this.loading = true;
  //   try {
  //     const res = await agent.Account.submitRegistration(
  //       this.registrationValue
  //     );
  //     runInAction(() => (this.loading = false));
  //     return res;
  //   } catch (err) {
  //     runInAction(() => (this.loading = false));
  //     throw err;
  //   }
  // };
}
