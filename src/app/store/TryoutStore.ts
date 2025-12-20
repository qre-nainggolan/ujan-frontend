import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { ListQuestion } from "../model/ListQuestion";
import {
  ListUserPackage,
  ListMainPackage,
  ListTypePackage,
} from "../model/ListPackage";
import { ListAnswer } from "../model/ListQuestionAnswer";
import { ItemQuestion } from "../model/ItemQuestion";
import { QuestionSubmissionValues } from "../model/QuestionSubmissionValues";
import { AnswerLog } from "./TestStore";

export default class TryoutStore {
  form: QuestionSubmissionValues = new QuestionSubmissionValues();
  isEditMode: boolean = false;
  showModal: boolean = false;
  showConfirmation: boolean = false;
  popupConfirmationClass: string = "popup__confirmation";
  IsTryoutStarted: boolean = false;
  TimeLeft: number = 0;
  CurrentQuestionId: number = 0;
  CurrentQuestion: ItemQuestion | null = null;
  SelectedChoice: string = "";
  SessionId: string | null = null;
  isLoadingTryout: boolean = false;

  data: ListQuestion[] = [];
  formData: ListQuestion | null = null;
  listMainPackage: ListMainPackage[] = [];
  listTypePackage: ListTypePackage[] = [];
  listUserPackage: ListUserPackage[] = [];
  listAnswer: ListAnswer[] = [];

  private timerId: ReturnType<typeof setInterval> | null = null;

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

  startTimer() {
    if (!this.IsTryoutStarted || this.TimeLeft <= 0) return;

    // Prevent multiple intervals
    if (this.timerId) clearInterval(this.timerId);

    this.timerId = setInterval(() => {
      if (this.TimeLeft <= 1) {
        this.stopTimer();
        alert("Time is up!");
        this.SetIsTryoutStarted(false);
        localStorage.removeItem("ujanSessionId");
        this.setTimeLeft(0);
      } else {
        this.setTimeLeft(this.TimeLeft - 1);
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
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

  setTimeLeft(second_: number) {
    this.TimeLeft = second_;
  }

  SetCurrentQuestionId = async (questionId_: number) => {
    this.CurrentQuestionId = questionId_;
  };

  SetIsTryoutStarted(isStarted_: boolean) {
    this.IsTryoutStarted = isStarted_;
  }

  SetCurrentQuestion = async (currentQuestion_: ItemQuestion) => {
    this.CurrentQuestion = currentQuestion_;
  };

  SetPopupConfirmationclass = async (class_: string) => {
    this.popupConfirmationClass = class_;
  };

  SetSessionId = async (sessionId_: string) => {
    this.SessionId = sessionId_ ?? null;
  };

  SetSelectedChoice = async (choice_: string) => {
    this.SelectedChoice = choice_;
  };

  ContinueTryout = async (sid_: string) => {
    const res = await agent.Tryout.continueTryout(
      sid_!,
      this.CurrentQuestion?.id ?? 0
    );

    if (res.data.done) {
      // show summary
    } else {
      this.SetCurrentQuestion(res.data.question);
    }
  };

  loadQuestion = async () => {
    this.isLoadingTryout = true;

    try {
      const res = await agent.Tryout.continueTryout(
        this.SessionId!,
        this.CurrentQuestionId ?? 0
      );
      if (!res.data.done) {
        this.SetCurrentQuestion(res.data.question);
        this.SetSelectedChoice("");
      }
    } catch (err) {
      console.error("Failed to continue tryout:", err);
    } finally {
      this.isLoadingTryout = false;
    }
  };

  SubmitAnAnswer = async (sessionId_: string) => {
    if (!this.SelectedChoice) return;

    agent.Tryout.submitAnswer({
      sessionId: sessionId_,
      questionId: this.CurrentQuestion?.id ?? 0,
      answer: this.SelectedChoice!,
      questionNumber: this.CurrentQuestion?.questionNumber ?? 0,
    });

    this.SetAnswer();
    this.ContinueTryout(sessionId_);
    this.SetSelectedChoice("");
  };

  StartTryout = async () => {
    this.isLoadingTryout = true;
    try {
      await agent.Tryout.startTryout(
        "9228ce30-05fd-4198-a19e-86d7149472b7",
        "TIU"
      ).then((response) => {
        const data = response.data;

        localStorage.setItem("ujanSessionId", data.sessionId);
        this.SetCurrentQuestion(data.question);
        this.SetIsTryoutStarted(true);
        this.SetSessionId(data.sessionId);
        this.setTimeLeft(1800);
        this.startTimer(); // ✅ start countdown
      });
    } catch (err) {
      console.error("Failed to start tryout");
    } finally {
      this.isLoadingTryout = false;
    }
  };

  ConfirmFinalSubmission = async (sessionId_: string) => {
    if (!this.SelectedChoice) return;

    if (sessionId_ === "") {
      alert("failed");
      return false;
    }
    try {
      this.isLoadingTryout = true;
      await agent.Tryout.submitFinalAnswer({
        sessionId: sessionId_,
        questionId: this.CurrentQuestion?.id ?? 0,
        questionNumber: this.CurrentQuestion?.questionNumber ?? 0,
        answer: this.SelectedChoice,
      }); // Call backend to move data
      alert("Final submission successful! Answers saved to database.");
      this.SetPopupConfirmationclass("popup__confirmation-show");
      localStorage.removeItem("ujanSessionId");
    } catch (error) {
      console.log(error);
      alert("Failed to submit answers. ");
    } finally {
      this.isLoadingTryout = false;
    }
  };

  SetAnswer = async () => {
    // console.log("this.SelectedChoice : " + this.SelectedChoice);
    // console.log("this.CurrentQuestionId : " + this.CurrentQuestionId);

    this.listAnswer = [
      ...this.listAnswer,
      {
        questionId: this.CurrentQuestionId,
        answer: this.SelectedChoice ?? "",
      },
    ];
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

  CheckIsTryoutStarted = async () => {
    const sessionID_ = localStorage.getItem("ujanSessionId");

    if (sessionID_ === undefined || sessionID_ === null) {
      this.SetIsTryoutStarted(false);
      return;
    }

    this.SetSessionId(sessionID_ ?? "");
    try {
      this.isLoadingTryout = true;
      const statusRes = await agent.Tryout.getSessionStatus(sessionID_ ?? "");
      const session = statusRes.data.session;

      this.setTimeLeft(session.remainingTime);
      this.startTimer(); // ✅ resume countdown
    } catch (err) {
      console.log("Error checking the tryout status " + err);
    } finally {
      this.isLoadingTryout = false;
    }

    try {
      this.isLoadingTryout = true;
      const answersRes = await agent.Tryout.getSubmittedAnswer(
        sessionID_ ?? ""
      );

      if (answersRes.data && answersRes.data.length > 0) {
        const highest: ListAnswer = answersRes.data.reduce(
          (max: AnswerLog, current: AnswerLog) => {
            return current.questionId > max.questionId ? current : max;
          }
        ) as ListAnswer;

        this.listAnswer = answersRes.data;
        this.SetCurrentQuestionId(highest.questionId);
      }
      this.SetIsTryoutStarted(true);
    } catch (err) {
      console.log("Error checking the tryout status " + err);
    } finally {
      this.isLoadingTryout = false;
    }
  };

  loadUserPackage = async () => {
    try {
      const result = await agent.UserPackage.getPurchasedPackage();
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
      Answer_Text: "",
      Package_Name: "",
      DateCreate: "",
      Image: "",
      Category: "",
      Explanation: this.sanitize(this.form.Explanation || ""),
    };

    const formData = new FormData();

    for (const [key, value] of Object.entries(clean)) {
      formData.append(key, value == null ? "" : String(value));
    }

    if (this.form.Image) {
      formData.append("Image", this.form.Image);
    }

    try {
      await agent.Package.submitQuestion(formData);
    } catch (err) {
      throw err;
    }
  };
}
