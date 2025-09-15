import { RegistrationData } from "./RegistrationData";

export class RegistrationDataSubmissionValue {
  username: string = "";
  email: string = "";
  password: string = "";
  appliedInstance?: string = "";
  emailConfirmed: string = "";
  dateCreate?: string = ""!;
  userStatus: string = "";

  constructor(activity?: RegistrationDataSubmissionValue) {
    if (activity) {
      this.username = activity.username;
      this.email = activity.email;
      this.password = activity.password;
      this.appliedInstance = activity.appliedInstance;
      this.emailConfirmed = activity.emailConfirmed;
      this.dateCreate = activity.dateCreate!;
      this.userStatus = activity.userStatus;
    }
  }
}

export class RegistrationDataSubmission implements RegistrationData {
  username: string = "";
  email: string = "";
  password: string = "";
  appliedInstance?: string = "";
  emailConfirmed: string = "";
  dateCreate: string = "";
  userStatus: string = "";

  constructor(init?: RegistrationDataSubmissionValue) {
    Object.assign(this, init);
  }
}
