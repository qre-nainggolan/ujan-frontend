import { createContext, useContext } from "react";
import CommonStore from "./CommonStore";
import UserStore from "./UserStore";
import QuestionStore from "./QuestionStore";
import TryoutStore from "./TryoutStore";
import PackageStore from "./PackageStore";
import PackageTypeStore from "./PackageTypeStore";
import PurchasePackageStore from "./PurchasePackageStore";
import AuthenticationStore from "./AuthenticationStore";
import TestStore from "./TestStore";
import ProgressStore from "./ProgressStore";
import PaymentStore from "./PaymentStore";

interface Store {
  CommonStore: CommonStore;
  UserStore: UserStore;
  QuestionStore: QuestionStore;
  TryoutStore: TryoutStore;
  PackageStore: PackageStore;
  PackageTypeStore: PackageTypeStore;
  PurchasePackageStore: PurchasePackageStore;
  AuthenticationStore: AuthenticationStore;
  TestStore: TestStore;
  ProgressStore: ProgressStore;
  PaymentStore: PaymentStore;
}

export const store: Store = {
  CommonStore: new CommonStore(),
  UserStore: new UserStore(),
  QuestionStore: new QuestionStore(),
  TryoutStore: new TryoutStore(),
  PackageStore: new PackageStore(),
  PackageTypeStore: new PackageTypeStore(),
  PurchasePackageStore: new PurchasePackageStore(),
  AuthenticationStore: new AuthenticationStore(),
  TestStore: new TestStore(),
  ProgressStore: new ProgressStore(),
  PaymentStore: new PaymentStore(),
};

export const StoreContext = createContext(store);

export function useStore() {
  return useContext(StoreContext);
}
