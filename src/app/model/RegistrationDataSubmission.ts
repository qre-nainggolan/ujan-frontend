import { RegistrationData } from "./RegistrationData";

export class RegistrationDataSubmissionValue {
  username: string = "";
  email: string = "";
  password: string = "";
  appliedInstance: string = "";
  appliedInstanceOther: string = "";
  emailConfirmed: string = "";
  dateCreate: string = ""!;
  userStatus: string = "";
  province: string = "";
  city: string = "";

  constructor(activity?: RegistrationDataSubmissionValue) {
    if (activity) {
      this.username = activity.username;
      this.email = activity.email;
      this.password = activity.password;
      this.appliedInstance = activity.appliedInstance;
      this.appliedInstanceOther = activity.appliedInstanceOther;
      this.emailConfirmed = activity.emailConfirmed;
      this.dateCreate = activity.dateCreate;
      this.userStatus = activity.userStatus;
      this.province = activity.province;
      this.city = activity.city;
    }
  }
}

export class RegistrationDataSubmission implements RegistrationData {
  username: string = "";
  email: string = "";
  password: string = "";
  appliedInstance: string = "";
  appliedInstanceOther: string = "";
  emailConfirmed: string = "";
  dateCreate: string = "";
  userStatus: string = "";
  province: string = "";
  city: string = "";

  constructor(init?: RegistrationDataSubmissionValue) {
    Object.assign(this, init);
  }
}
