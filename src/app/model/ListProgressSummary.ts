export interface TestHistoryItem {
  id: string;
  packageName: string;
  subtestName: string;
  score: number;
  date: string;
  durationMinutes: number;
  category: string;
}

export interface ListProgressSummary {
  sessionId: string;
  userId: string;
  startedAt: string;
  packageId: string;
  type: string;
  totalAnswers: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalQuestions: number;
  remaining: number;
  lastAnsweredAt: string | null;
  percentage: number;
  status: string;
  duration: number | null;
}

export interface ListProgressSummaryResponse {
  total: number;
  data: ListProgressSummary[];
}
