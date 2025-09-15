import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { ListQuestion } from "../model/ListQuestion";
import {
  ListUserPackage,
  ListMainPackage,
  ListTypePackage,
} from "../model/ListPackage";
import { QuestionSubmissionValues } from "../model/QuestionSubmissionValues";

export default class QuestionStore {
  form: QuestionSubmissionValues = new QuestionSubmissionValues();
  isEditMode: boolean = false;
  showModal: boolean = false;
  showConfirmation: boolean = false;

  data: ListQuestion[] = [];
  formData: ListQuestion | null = null;
  listMainPackage: ListMainPackage[] = [];
  listTypePackage: ListTypePackage[] = [];
  listUserPackage: ListUserPackage[] = [];
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

  setField = <P extends keyof QuestionSubmissionValues>(
    prop: P,
    value: QuestionSubmissionValues[P]
  ) => {
    this.form = { ...this.form, [prop]: value };
  };

  setForm = (data: QuestionSubmissionValues) => {
    this.form = new QuestionSubmissionValues(data);
  };

  clearForm = () => {
    this.form = new QuestionSubmissionValues();
  };

  setEditMode = (value: boolean) => {
    this.isEditMode = value;
  };

  setShowModal = (value: boolean) => {
    this.showModal = value;
  };

  setShowConfirmation = (value: boolean) => {
    this.showConfirmation = value;
  };

  clearFormData = () => {
    this.formData = {
      Package_ID: "",
      Question_ID: "",
      Question: "",
      Type_ID: "",
      OptionA: "",
      OptionB: "",
      OptionC: "",
      OptionD: "",
      OptionE: "",
      Answer_Text: "",
      Explanation: "",
      Package_Name: "",
      Answer: "",
      DateCreate: "",
      Note: "",
      Image: "",
      Category: "",
    };
  };

  setPackageID = (id: string) => {
    this.Package_ID = id;
  };

  setStartDate = (value: string) => {
    this.startDate = value;
  };

  setEndDate = (value: string) => {
    this.endDate = value;
  };

  setPageSize = (size: number) => {
    this.pageSize = size;
  };

  setCurrentPage = (page: number) => {
    this.currentPage = page;
  };

  setTotalPage = (total: number) => {
    this.totalPages = total;
  };

  setTotalData = (total: number) => {
    this.totalData = total;
  };

  fetchData = async (
    Package_ID_: string,
    _: string,
    startDate_: string,
    endDate_: string,
    currentPage_: number,
    pageSize_: number
  ) => {
    try {
      this.loading = true;
      const result = await agent.Package.getPaginatedQuestionList(
        Package_ID_,
        "",
        startDate_,
        endDate_,
        currentPage_,
        pageSize_
      );

      this.data = result.data;
      const totalPages_ = Math.ceil(result.total / this.pageSize);
      const totalData_ = result.total;

      this.setCurrentPage(currentPage_);
      this.setPageSize(pageSize_);

      this.setStartDate(startDate_);
      this.setEndDate(endDate_);

      this.setTotalPage(totalPages_);
      this.setTotalData(totalData_);
    } catch (error) {
      console.error("fetchData error:", error);
    } finally {
      this.loading = false;
    }
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

  loadMainPackage = async () => {
    try {
      const result = await agent.Package.getListMainPackage();
      this.listMainPackage = result.data;
    } catch (error) {
      console.error("loadMainPackages error:", error);
    }
  };

  loadTypePackage = async (packageId: string) => {
    try {
      const result = await agent.Package.getListTypePackage(packageId);
      this.listTypePackage = result.data;
    } catch (error) {
      console.error("loadTypePackages error:", error);
    }
  };

  sanitize = (text: string) => {
    return text
      .replace(/'/g, "&#39;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  };

  submitQuestion = async () => {
    if (!this.form.Package_ID || !this.form.Question || !this.form.Answer) {
      throw new Error("Required fields are missing.");
    }

    const clean = {
      ...this.form,
      Question_ID: parseInt(this.form.Question_ID || "0"),
      Package_ID: this.sanitize(this.form.Package_ID || ""),
      Question: this.sanitize(this.form.Question || ""),
      Type_ID: this.sanitize(this.form.Type_ID || ""),
      OptionA: this.sanitize(this.form.OptionA || ""),
      OptionB: this.sanitize(this.form.OptionB || ""),
      OptionC: this.sanitize(this.form.OptionC || ""),
      OptionD: this.sanitize(this.form.OptionD || ""),
      OptionE: this.sanitize(this.form.OptionE || ""),
      Note: "",
      Image: "",
      Category: "",
      Explanation: this.sanitize(this.form.Explanation || ""),
    };

    try {
      await agent.Package.submitQuestion(clean);
      await this.fetchData(
        this.Package_ID,
        "",
        this.startDate,
        this.endDate,
        this.currentPage,
        this.pageSize
      );
    } catch (err) {
      throw err;
    }
  };
}
