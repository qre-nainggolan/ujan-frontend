import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";

interface MainPackage {
  Package_ID: number | string;
  Name: string;
}

export default class PackageTypeStore {
  // ---------- Observable fields ----------
  listPackageType = []; // data for grid
  listMainPackage: MainPackage[] = []; // <-- typed!

  Package_ID = "";
  startDate = this.getNow("yes");
  endDate = this.getNow("");

  currentPage = 1;
  totalPages = 1;
  totalData = 0;
  pageSize = 50;

  selectedIndex: number | null = null;

  isEditMode = false;
  showModal = false;
  showConfirmation = false;

  formData: any = null;

  constructor() {
    makeAutoObservable(this);
  }

  // ---------- Generic setter ----------
  setField = (field: string, value: any) => {
    (this as any)[field] = value;
  };

  // ---------- Utils ----------
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

  // ---------- Backend calls ----------

  loadMainPackages = async () => {
    try {
      const res = await agent.Package.getListMainPackage();
      runInAction(() => {
        this.listMainPackage = res.data;
      });
    } catch (err) {
      console.error("loadMainPackages error:", err);
    }
  };

  loadPackageTypes = async (
    package_ID_: string,
    start_: string,
    end_: string,
    page_: number,
    size_: number
  ) => {
    try {
      const res = await agent.Package.getPaginatedPackageTypeList(
        package_ID_,
        "",
        this.formatDateForBackend(start_),
        this.formatDateForBackend(end_),
        page_,
        size_
      );

      runInAction(() => {
        this.listPackageType = res.data;
        this.totalData = res.total;
        this.totalPages = Math.ceil(res.total / this.pageSize);
      });
    } catch (err) {
      console.error("loadPackageTypes error:", err);
    }
  };

  submitPackageType = async () => {
    if (!this.formData) return;
    try {
      await agent.Package.submitPackageType(this.formData);
      return true;
    } catch (err) {
      console.error("submitPackageType error:", err);
      return false;
    }
  };

  // ---------- Helpers ----------
  private formatDateForBackend(dateStr: string) {
    const d = new Date(dateStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const ii = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${ii}`;
  }
}
