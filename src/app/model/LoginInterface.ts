export interface User {
  username: string;
  displayName: string;
  token: string;
  image?: string;
}

export interface LoginInterface {
  username: string;
  email: string;
  password: string;
}

export interface LoraInterface {
  m: string;
  r: string;
  a: string;
  sp: string;
  mt: string;
  mnt: string;
  hmt: string;
  hmnt: string;
  mn: string;
  ac: string;
  hc: string;
}
