import { makeAutoObservable } from "mobx";
import agent from "../api/agent";
import {
  ListProgressSummary,
  TestHistoryItem,
} from "../model/ListProgressSummary";

export interface ProgressSummary {
  totalTests: number;
  averageScore: number;
  bestScore: number;
}

export interface LearningPlan {
  weakArea: string;
  suggestedTestName: string;
  note: string;
}

export default class ProgressStore {
  summary: ProgressSummary | null = null;
  recentTests: TestHistoryItem[] = [];
  learningPlan: LearningPlan | null = null;
  isLoading = false;
  testHistory: TestHistoryItem[] = [];

  constructor() {
    makeAutoObservable(this);
    // this.seedMockData(); // <-- this fills testHistory with mimic data
  }
  loadProgress = async () => {
    this.isLoading = true;

    try {
      const res: any = await agent.Score.getProgressSummary("", 1, 10);

      const raw: ListProgressSummary[] = res.data;

      const mapped: TestHistoryItem[] = raw.map((item: any) => ({
        id: item.sessionId,
        packageName: item.packageId ?? "Paket Tidak Diketahui",
        subtestName: item.type,
        score: item.percentage,
        date: item.startedAt,
        durationMinutes: item.duration ? Math.round(item.duration / 60) : 0,
        category: item.type,
      }));

      // History + recent tests
      this.testHistory = mapped;
      this.recentTests = mapped.slice(0, 4);

      // Summary
      const totalTests = mapped.length;
      const averageScore =
        totalTests === 0
          ? 0
          : Math.round(
              mapped.reduce((sum, t) => sum + t.score, 0) / totalTests
            );

      const bestScore = totalTests
        ? Math.max(...mapped.map((t) => t.score))
        : 0;

      this.summary = {
        totalTests,
        averageScore,
        bestScore,
      };

      // Learning plan
      if (mapped.length > 0) {
        const weakest = mapped.reduce((min, t) =>
          t.score < min.score ? t : min
        );

        this.learningPlan = {
          weakArea: weakest.subtestName,
          suggestedTestName: weakest.subtestName + " – Sesi Berikutnya",
          note: "Latih kembali tipe soal ini selama 15 menit.",
        };
      } else {
        this.learningPlan = null;
      }
    } finally {
      this.isLoading = false;
    }
  };
}
