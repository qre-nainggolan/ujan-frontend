import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { ListUserPackage } from "../model/ListPackage";

export default class PackageStore {
  isEditMode: boolean = false;
  showModal: boolean = false;
  showConfirmation: boolean = false;

  listUserPackage: ListUserPackage[] = [];
  listAvailablePackage: ListUserPackage[] = [];
  loading = false;

  Package_ID = "";
  startDate = this.getNow("yes");
  endDate = this.getNow("");
  currentPage = 1;
  totalPages = 1;
  totalData = 0;
  pageSize = 50;

  constructor() {
    makeAutoObservable(this);
  }

  getNow(GetSevenAM: string) {
    const now = new Date();
    if (GetSevenAM === "yes") now.setHours(7, 0, 0, 0);
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const mi = String(now.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }

  setEditMode = (value: boolean) => {
    this.isEditMode = value;
  };

  setShowModal = (value: boolean) => {
    this.showModal = value;
  };

  setShowConfirmation = (value: boolean) => {
    this.showConfirmation = value;
  };

  loadUserPackage = async () => {
    try {
      const result = await agent.Package.getPurchasedPackage();
      const data = Array.isArray(result?.data) ? result.data : [];
      runInAction(() => {
        this.listUserPackage = data;
      });
    } catch (e) {
      console.error("loadUserPackage error:", e);
      runInAction(() => {
        this.listUserPackage = []; // keep it an array
      });
    }
  };

  loadAvailablePackage = async () => {
    try {
      const data = await agent.Package.getPackage();
      runInAction(() => {
        this.listAvailablePackage = data;
      });
    } catch (e) {
      console.error("loadUserPackage error:", e);
      runInAction(() => {
        this.listUserPackage = []; // keep it an array
      });
    }
  };
}
