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

export interface PurchaseInterface {
  packageId: string;
  packageName: string;
}
