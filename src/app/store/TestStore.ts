import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";

export type Question_ = {
  id: number;
  questionNumber: number;
  text: string;
  done: boolean;
  image: string;
  choices: string[];
};

export interface TestDetail {
  question_id: number;
  answer: string;
  is_correct: boolean;
  questionText: string;
  answerText: string;
  explanation: string;
  optionAnswer: string;
}

export interface TestSummary {
  package_id: string;
  type: string;
  total_questions: number;
  total_correct: number;
  total_wrong: number;
  percentage: number;
  answered_at: string;
  details: TestDetail[];
}

export type AnswerLog = {
  questionId: number;
  questionNumber: number;
  answer: string;
};

export default class TestStore {
  packageId = "";
  packageDetail = "";
  currentQuestion: Question_ | null = null;
  answerList: AnswerLog[] = [];
  sessionId = "";
  remainingTime = 0;
  isStarted = false;
  isLast = false;
  questionNumber = 1;
  selectedChoice: string | null = null;
  sessionExpired = false;
  private timerInterval: any = null;
  testFinished = false;
  subtestList: any[] = [];
  isLoadingSubtest = false;
  isLoadingSession = true;

  summary: TestSummary | null = null;
  isLoadingSummary = false;

  selectedSubtest: string | null = null;
  filterStatus: "all" | "correct" | "wrong" = "all";

  totalQuestion = 0;
  questionNumberList: number[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setFilterStatus = async (status: "all" | "correct" | "wrong") => {
    this.filterStatus = status;
  };

  setSelectedSubtest = async (section: string) => {
    this.selectedSubtest = section;
  };

  setPackageId = (packageId: string) => {
    this.packageId = packageId;
  };

  generateQuestionList = (total: number) => {
    this.totalQuestion = total;
    this.questionNumberList = Array.from({ length: total }, (_, i) => i + 1);
  };

  get filteredDetails() {
    if (!this.summary || !this.summary.details) return [];

    switch (this.filterStatus) {
      case "correct":
        return this.summary.details.filter((d) => d.is_correct === true);

      case "wrong":
        return this.summary.details.filter((d) => d.is_correct === false);

      default:
        return this.summary.details;
    }
  }

  loadSubtest = async (packageId: string) => {
    this.isLoadingSubtest = true;
    try {
      const res = await agent.UserPackage.getSubtest(packageId);
      runInAction(() => {
        this.subtestList = res.data;
      });
    } finally {
      runInAction(() => {
        this.isLoadingSubtest = false;
      });
    }
  };

  loadPackageDetail = async () => {
    // this.packageId = package_id_;
    try {
      const response = await agent.UserPackage.getPackageInformation(
        this.packageId,
        this.selectedSubtest!
      );
      runInAction(() => {
        this.packageDetail = response.data.packageDetail;
        this.selectedSubtest = response.data.sub;
      });
    } finally {
      this.isLoadingSession = false;
    }
  };

  initTest = async () => {
    const existing = localStorage.getItem("ujanTestSessionId");

    if (!existing || existing === "undefined" || existing === null) {
      runInAction(() => {
        this.isStarted = false;
        this.testFinished = false;
      });
      return;
    }

    const res = await agent.UserPackage.checkSessionExists(existing);
    const status = res.data.status; // assuming API wraps it like {status: "finished"}

    console.log("status : " + status + " The session: " + existing);

    if (status === "not found") {
      runInAction(() => {
        this.isStarted = false;
        this.testFinished = false;
      });
      localStorage.removeItem("ujanTestSessionId");
      return;
    }

    if (status === "finished") {
      runInAction(() => {
        this.testFinished = true; // ✅ show message
        this.isStarted = false;
      });
      localStorage.removeItem("ujanTestSessionId");
      return;
    }

    if (status === "ongoing") {
      this.packageId = res.data.packageId;
      this.selectedSubtest = res.data.sub;
      await this.loadSession(existing);

      this.startTimer();
      this.isStarted = true;
    }
  };

  startTest = async () => {
    const res = await agent.UserPackage.startTest(
      this.packageId,
      this.selectedSubtest!
    );

    runInAction(() => {
      this.testFinished = false;
      this.sessionId = res.data.sessionId;
      localStorage.setItem("ujanTestSessionId", res.data.sessionId);

      const starter_: Question_ = {
        id: 0,
        text: "starter question?",
        done: false,
        questionNumber: 0,
        image: "",
        choices: ["A", "B", "C", "D"],
      };

      this.currentQuestion = starter_;

      this.remainingTime = res.data.timeLeft;
      this.setIsStarted(true);

      this.startTimer();
    });
  };

  setIsStarted = async (start: boolean) => {
    this.isStarted = start;
  };

  private loadSession = async (sessionId: string) => {
    this.isLoadingSession = true;
    const resSession = await agent.UserPackage.getTestSession(sessionId);
    const resAnswers = await agent.UserPackage.getTestAnswer(sessionId);

    runInAction(() => {
      this.sessionId = sessionId;
      this.currentQuestion = null;
      this.remainingTime = resSession.data.session.remainingTime;
      this.answerList = resAnswers.data;
      this.isStarted = true;
    });

    try {
      this.loadQuestion(resSession.data.session.currentQuestionId);
    } finally {
      this.isLoadingSession = false;
    }
  };

  private loadQuestion = async (qId: number) => {
    const res = await agent.UserPackage.continueTest(
      this.sessionId,
      qId === undefined ? 0 : qId,
      this.packageId,
      this.selectedSubtest || "TIU"
    );
    if (!res.data.done) {
      runInAction(() => {
        this.currentQuestion = res.data.question;
        this.selectedChoice = null;

        // NEW: generate full questions list
        if (res.data.totalQuestion) {
          this.generateQuestionList(res.data.totalQuestion);
        }

        let counter_: number = 1;
        this.answerList.map((a) => {
          if (a.questionId === qId) {
            counter_++;
            return;
          }
          counter_++;
        });
        this.isLast = res.data.isLast ? res.data.isLast : false;
        // if (res.data.isLast) {
        //   counter_--;
        // }
        this.questionNumber = counter_;
      });
    }
  };

  answerAndAdvance = async () => {
    if (!this.selectedChoice || !this.currentQuestion) return;

    await agent.UserPackage.answerTest({
      sessionId: this.sessionId,
      questionId: this.currentQuestion.id,
      questionNumber: this.currentQuestion.questionNumber,
      answer: this.selectedChoice,
    });

    // update local list
    const existing = this.answerList.findIndex(
      (a) => a.questionId === this.currentQuestion!.id
    );

    const submitted = {
      questionId: this.currentQuestion.id,
      questionNumber: this.currentQuestion.questionNumber,
      answer: this.selectedChoice,
    };
    runInAction(() => {
      if (existing >= 0) {
        this.answerList[existing] = submitted;
      } else {
        this.answerList.push(submitted);
      }
    });

    // load next
    const res = await agent.UserPackage.continueTest(
      this.sessionId,
      this.currentQuestion.id === undefined ? 0 : this.currentQuestion.id,
      this.packageId,
      this.selectedSubtest || "TIU"
    );
    if (res.data.done) {
      // finished => do nothing (component can show summary)
      return;
    }
    runInAction(() => {
      this.isLast = res.data.isLast;
      this.currentQuestion = res.data.question;
      this.selectedChoice = null;
      const idx = this.answerList.findIndex(
        (a) => a.questionId === res.data.question.id
      );
      this.questionNumber = idx >= 0 ? idx + 1 : this.questionNumber + 1;
    });
  };

  jumpToQuestion = async (qId: number, qNumber: number, answered: boolean) => {
    var res: any;
    if (answered)
      res = await agent.UserPackage.checkQuestion(this.sessionId, qId, qNumber);
    else {
      res = await agent.UserPackage.goIntoQuestion(
        this.sessionId,
        qId,
        this.packageId,
        this.selectedSubtest || ""
      );
    }

    runInAction(() => {
      this.isLast = res.data.isLast;
      this.currentQuestion = res.data.question;
      const matched = this.answerList.find((a) => a.questionId === qId);
      this.selectedChoice = matched?.answer ?? null;
      const idx = this.answerList.findIndex((a) => a.questionId === qId);
      this.questionNumber = idx + 1;
    });
  };

  submitTest = async () => {
    this.isLoadingSummary = true;
    const result = await agent.UserPackage.submitTest({
      sessionId: this.sessionId,
      questionId: this.currentQuestion?.id ?? 0,
      questionNumber: this.currentQuestion?.questionNumber ?? 0,
      answer: this.selectedChoice ?? "",
    });

    localStorage.removeItem("ujanTestSessionId");
    clearInterval(this.timerInterval);

    runInAction(() => {
      this.summary = result.data.data;
      this.isLoadingSummary = false;
      // 🔥 CLEAR ALL STORED ANSWERS
      this.answerList = [];

      // 🔥 Reset question fields
      this.currentQuestion = null;
      this.selectedChoice = null;
      this.questionNumber = 1;
      this.isLast = false;

      // 🔥 Reset test state
      this.testFinished = true;
      this.isStarted = false;
      this.sessionId = "";
      this.remainingTime = 0;
      this.sessionExpired = false;

      this.selectedSubtest = "";
    });
  };

  setSelectedChoice = (c: string) => {
    this.selectedChoice = c;
  };

  // ------ Timer -------
  private startTimer = () => {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      runInAction(() => {
        if (this.remainingTime > 0) {
          this.remainingTime -= 1;
        }
      });
    }, 1000);
  };
}
