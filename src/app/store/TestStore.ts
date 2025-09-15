// app/store/TestStore.ts
import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";

export type Question_ = {
  id: number;
  text: string;
  done: boolean;
  choices: string[];
};

export type AnswerLog = {
  questionId: number;
  answer: string;
};

export default class TestStore {
  package_id = "";
  packageDetail = "";
  currentQuestion: Question_ | null = null;
  answerList: AnswerLog[] = [];
  sessionId = "";
  remainingTime = 0;
  isStarted = false;
  questionNumber = 1;
  selectedChoice: string | null = null;
  sessionExpired = false;
  private timerInterval: any = null;
  testFinished = false;

  constructor() {
    makeAutoObservable(this);
  }

  // Load package name / description
  loadPackageDetail = async (package_id_: string) => {
    this.package_id = package_id_;
    const response = await agent.UserPackage.getDetailPackage(package_id_);
    runInAction(() => {
      this.packageDetail = response.data;
    });
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
      await this.loadSession(existing);
      this.startTimer();
    }
  };

  startTest = async () => {
    const res = await agent.UserPackage.startTest();
    runInAction(() => {
      this.sessionId = res.data.sessionId;
      localStorage.setItem("ujanTestSessionId", res.data.sessionId);
      this.currentQuestion = res.data.question;
      this.remainingTime = res.data.timeLeft;
      this.isStarted = true;

      this.startTimer();
    });
  };

  private loadSession = async (sessionId: string) => {
    const resSession = await agent.UserPackage.getTestSession(sessionId);
    const resAnswers = await agent.UserPackage.getTestAnswer(sessionId);

    runInAction(() => {
      this.sessionId = sessionId;
      this.currentQuestion = null;
      this.remainingTime = resSession.data.session.remainingTime;
      this.answerList = resAnswers.data;
      this.isStarted = true;
    });

    // load first question after we have the session
    await this.loadQuestion(resSession.data.session.currentQuestionId);
  };

  private loadQuestion = async (qId: number) => {
    const res = await agent.UserPackage.continueTest(
      this.sessionId,
      qId,
      this.package_id
    );
    if (!res.data.done) {
      runInAction(() => {
        this.currentQuestion = res.data.question;
        this.selectedChoice = null;

        let counter_: number = 1;
        this.answerList.map((a) => {
          if (a.questionId === qId) {
            counter_++;
            return;
          }
          counter_++;
        });
        this.questionNumber = counter_;
      });
    }
  };

  answerAndAdvance = async () => {
    if (!this.selectedChoice || !this.currentQuestion) return;

    await agent.UserPackage.answerTest({
      sessionId: this.sessionId,
      questionId: this.currentQuestion.id,
      answer: this.selectedChoice,
    });

    // update local list
    const existing = this.answerList.findIndex(
      (a) => a.questionId === this.currentQuestion!.id
    );
    const submitted = {
      questionId: this.currentQuestion.id,
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
      this.currentQuestion.id,
      this.package_id
    );
    if (res.data.done) {
      // finished => do nothing (component can show summary)
      return;
    }
    runInAction(() => {
      this.currentQuestion = res.data.question;
      this.selectedChoice = null;
      const idx = this.answerList.findIndex(
        (a) => a.questionId === res.data.question.id
      );
      this.questionNumber = idx >= 0 ? idx + 1 : this.questionNumber + 1;
    });
  };

  jumpToQuestion = async (qId: number) => {
    const res = await agent.UserPackage.checkQuestion(this.sessionId, qId);
    runInAction(() => {
      this.currentQuestion = res.data.question;
      const matched = this.answerList.find((a) => a.questionId === qId);
      this.selectedChoice = matched?.answer ?? null;
      const idx = this.answerList.findIndex((a) => a.questionId === qId);
      this.questionNumber = idx + 1;
    });
  };

  submitTest = async () => {
    await agent.UserPackage.submitTest({
      sessionId: this.sessionId,
      questionId: this.currentQuestion?.id ?? 0,
      answer: this.selectedChoice ?? "",
    });

    localStorage.removeItem("ujanTestSessionId");
    clearInterval(this.timerInterval);

    runInAction(() => {
      this.testFinished = true;
      this.isStarted = false;
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
