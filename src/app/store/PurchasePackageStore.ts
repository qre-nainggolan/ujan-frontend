import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { ListUserPackage } from "../model/ListPackage";

type PackageDetail = {
  id: string;
  package_id: string;
  name: string;
  final_price: number;
  description: string;
};

export default class PurchasePackageStore {
  packageDetail: PackageDetail | null = null;
  purchaseLoading = true;
  purchaseName = "";
  purchaseConfirmed = false;

  constructor() {
    makeAutoObservable(this);
  }

  setField = (field: string, value: any) => {
    (this as any)[field] = value;
  };
  loadPackageDetail = async (packageId: string) => {
    runInAction(() => {
      this.purchaseLoading = true;
    });

    try {
      const response: ListUserPackage[] = await agent.Package.getPackage();

      const cleanId = packageId.replace(/"/g, "").trim();

      const found = response.find((p) => p.package_id.trim() === cleanId);

      runInAction(() => {
        this.packageDetail = found ?? null;
      });
    } catch (err) {
      console.error("Failed to load packages", err);
    } finally {
      runInAction(() => {
        this.purchaseLoading = false;
      });
    }
  };

  purchasePackage = async (packageId: string) => {
    if (!this.packageDetail) return;
    await agent.Package.purcahsePackage({ package_id: packageId }, packageId);
    runInAction(() => {
      this.purchaseConfirmed = true;
    });
  };
}
