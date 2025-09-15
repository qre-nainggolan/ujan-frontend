import { UserProfile } from "./UserProfile";

export class UserDataSubmissionValues {
  userID: string = "";
  nama_User: string = "";
  fingerprint: string = "";
  expired_Password: string = "";
  lastChange: string = "";
  user_Profile?: string = ""!;
  approval_Notes: string = "";
  registering?: string = "";
  password?: string = "";
  retypePassword?: string = "";
  status?: string = "";

  constructor(activity?: UserDataSubmissionValues) {
    if (activity) {
      this.userID = activity.userID;
      this.nama_User = activity.nama_User;
      this.fingerprint = activity.fingerprint;
      this.expired_Password = activity.expired_Password;
      this.lastChange = activity.lastChange;
      this.user_Profile = activity.user_Profile!;
      this.approval_Notes = activity.approval_Notes;
      this.registering = activity.registering!;
      this.password = activity.password!;
      this.retypePassword = activity.retypePassword!;
      this.status = activity.status!;
    }
  }
}

export class UserDataSubmission implements UserProfile {
  userID: string = "";
  nama_User: string = "";
  fingerprint: string = "";
  expired_Password: string = "";
  lastChange: string = "";
  user_Profile: string = ""!;
  registering: string = ""!;
  approval_Notes: string = "";
  password: string = "";
  retypePassword: string = "";
  status: string = "";
  displayName: string = "";

  constructor(init?: UserDataSubmissionValues) {
    Object.assign(this, init);
  }
}
