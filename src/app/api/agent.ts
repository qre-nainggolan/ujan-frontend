import axios, { AxiosResponse } from "axios";
import { LoginInterface, User } from "../model/LoginInterface";
import { store } from "../store/store";
import { UserProfile } from "../model/UserProfile";
import { PostResponse } from "../model/PostResponse";
import { RegistrationDataSubmissionValue } from "../model/RegistrationDataSubmission";
import { ListUserScore } from "../model/ListUserScore";
import { ListUserPackage } from "../model/ListPackage";

interface SubmitAnswerRequest {
  sessionId: string;
  questionId: number;
  answer: string;
}

interface TryoutResponse {
  sessionId: string;
  timeLeft: number;
  done: boolean;
  question: {
    id: number;
    text: string;
    done: boolean;
    choices: string[];
  };
}

interface SessionStatus {
  startTime: number;
  currentQuestionId: number;
  remainingTime: number;
  isFinished: boolean;
}

interface SessionStatusResponse {
  session: SessionStatus;
}

type AnswerLog = {
  questionId: number;
  answer: string;
};

type PackageDetail = {
  package_id: string;
};

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

// axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.baseURL =
  process.env.REACT_APP_API_URL || "http://localhost:9009/api";

axios.interceptors.request.use((config) => {
  const token = store.CommonStore.token;
  if (token) config.headers!.Authorization = `Bearer ${token}`;

  return config;
});

const requests = {
  get: <T>(url: string) =>
    axios.get<T>(url).then(responseBody).catch(errorHandler),
  post: <T>(url: string, body: {}) =>
    axios.post<T>(url, body).then(responseBody).catch(errorHandler),
};

function errorHandler(error: any) {
  console.error("API Error:", error);
  return Promise.reject(error);
}

const Account = {
  login: (user: LoginInterface) => requests.post<User>(`/account/login`, user),
  logout: (sessionId: string): Promise<AxiosResponse<any>> =>
    axios.get(`/account/logout?sessionID=${sessionId}`),
  getUserProfile: (): Promise<AxiosResponse<UserProfile>> =>
    axios.get(`/account/get-user-profile`),
  submitRegistration: (params: RegistrationDataSubmissionValue) =>
    requests.post<PostResponse>(`/account/submitRegistration`, params),
};

const Lora = {
  getCurrentGraph: (id1: string, id2: string, id3: string, id4: string) =>
    axios
      .get<any>(
        `/lora/get-current-graph?id=${id1}&id2=${id2}&id3=${id3}&id4=${id4}`
      )
      .then(responseBody),
  getLatestValue: (machine: string, mill: string) =>
    axios
      .get<any>(`/lora/get-latest-value?machine=${machine}&mill=${mill}`)
      .then(responseBody),
  getSensorData: (machine: string, mill: string) =>
    axios
      .get<any>(`/lora/get-sensor-data?machine=${machine}&mill=${mill}`)
      .then(responseBody),
  getPaginatedSensorData: (
    machineID: string,
    mill: string,
    startDate: string,
    endDate: string,
    currentPage: number,
    pageSize: number
  ) =>
    axios
      .get<any>(
        `/lora/get-paginated-sensor-data?machineID=${machineID}&mill=${mill}&start=${startDate}&end=${endDate}&page=${currentPage}&limit=${pageSize}`
      )
      .then(responseBody),
  submitRegistration: (params: RegistrationDataSubmissionValue) =>
    requests.post<PostResponse>(`/account/submitRegistration`, params),
};

const Tryout = {
  startTryout: (): Promise<AxiosResponse<TryoutResponse>> =>
    axios.get(`/ujantest/start-tryout`),
  continueTryout: (
    sessionId: string,
    lastQuestionId: number
  ): Promise<AxiosResponse<TryoutResponse>> =>
    axios.get(
      `/ujantest/continue-tryout?sessionId=${sessionId}&lastQuestionId=${lastQuestionId}`
    ),
  getSessionStatus: (
    sessionId: string
  ): Promise<AxiosResponse<SessionStatusResponse>> =>
    axios.get(`/ujantest/get-session-status?sessionId=${sessionId}`),
  getSubmittedAnswer: (
    sessionId: string
  ): Promise<AxiosResponse<AnswerLog[]>> =>
    axios.get(`/ujantest/get-submitted-answer?sessionId=${sessionId}`),
  submitAnswer: (params: SubmitAnswerRequest): Promise<AxiosResponse<any>> =>
    axios.post(`/ujantest/submit-answer`, params),
  submitFinalAnswer: (
    params: SubmitAnswerRequest
  ): Promise<AxiosResponse<any>> =>
    axios.post(`/ujantest/submit-final-answer`, params),
};

const UserPackage = {
  startTest: (): Promise<AxiosResponse<TryoutResponse>> =>
    axios.get(`/userpackage/start-test`),
  checkSessionExists: (sessionId: string) =>
    axios.get("/userpackage/check-session-exists", { params: { sessionId } }),
  continueTest: (
    sessionId: string,
    lastQuestionId: number,
    package_id: string
  ): Promise<AxiosResponse<TryoutResponse>> =>
    axios.get(
      `/userpackage/continue-test?sessionId=${sessionId}&lastQuestionId=${lastQuestionId}&package_id=${package_id}`
    ),
  checkQuestion: (
    sessionId: string,
    lastQuestionId: number
  ): Promise<AxiosResponse<TryoutResponse>> =>
    axios.get(
      `/userpackage/check-question?sessionId=${sessionId}&lastQuestionId=${lastQuestionId}`
    ),
  getDetailPackage: (packageID: string): Promise<AxiosResponse<any>> =>
    axios.get(`/userpackage/get-package-information?Package_ID=${packageID}`),
  getTestSession: (
    sessionId: string
  ): Promise<AxiosResponse<SessionStatusResponse>> =>
    axios.get(`/userpackage/get-test-session?sessionId=${sessionId}`),
  getTestAnswer: (sessionId: string): Promise<AxiosResponse<AnswerLog[]>> =>
    axios.get(`/userpackage/get-test-answer?sessionId=${sessionId}`),
  answerTest: (params: SubmitAnswerRequest): Promise<AxiosResponse<any>> =>
    axios.post(`/userpackage/answer-test`, params),
  submitTest: (params: SubmitAnswerRequest): Promise<AxiosResponse<any>> =>
    axios.post(`/userpackage/submit-test`, params),
};

const Score = {
  getScoreSummary: (
    keyword_: string,
    currentPage: number,
    pageSize: number
  ): Promise<AxiosResponse<ListUserScore>> =>
    axios
      .get(
        `/ujanscore/get-score-summary?keyword=${keyword_}&page=${currentPage}&limit=${pageSize}`
      )
      .then(responseBody),
  getScoreDetails: () => axios.get("/ujanscore/get-score-details"),
};

const Package = {
  getPackage: () =>
    axios.get<ListUserPackage[]>(`/package/get-package`).then(responseBody),
  getPackageTest: (): Promise<any[]> => {
    console.log("📦 getPackageTest() called"); // new log
    return axios.get(`/package/get-package`).then((res) => {
      console.log("📦 Raw response from /package/get-package:", res);
      return res.data;
    });
  },
  getListMainPackage: (): Promise<AxiosResponse<any>> =>
    axios.get(`/package/get-list-main-package`),
  getListTypePackage: (package_id: string): Promise<AxiosResponse<any>> =>
    axios.get(`/package/get-list-type-package?package_id=${package_id}`),
  getPurchasedPackage: (): Promise<AxiosResponse<any>> =>
    axios.get(`/package/get-purchased-package`),
  purcahsePackage: (params: PackageDetail, package_id: string) =>
    requests.post<PostResponse>(
      `/package/purchase-package?package_id=${package_id}`,
      params
    ),
  getPaginatedQuestionList: (
    package_id: string,
    category: string,
    startDate: string,
    endDate: string,
    currentPage: number,
    pageSize: number
  ) =>
    axios
      .get<any>(
        `/package/get-paginated-question-list?package_id=${package_id}&category=${category}&start=${startDate}&end=${endDate}&page=${currentPage}&limit=${pageSize}`
      )
      .then(responseBody),
  getPaginatedPackageTypeList: (
    package_id: string,
    category: string,
    startDate: string,
    endDate: string,
    currentPage: number,
    pageSize: number
  ) =>
    axios
      .get<any>(
        `/package/get-paginated-package-type-list?package_id=${package_id}&category=${category}&start=${startDate}&end=${endDate}&page=${currentPage}&limit=${pageSize}`
      )
      .then(responseBody),
  submitQuestion: (params: any): Promise<AxiosResponse<any>> =>
    axios.post(`/package/submit-question`, params),
  submitPackageType: (params: any): Promise<AxiosResponse<any>> =>
    axios.post(`/package/submit-package-type`, params),
};

const agent = {
  Account,
  Lora,
  Tryout,
  Score,
  Package,
  UserPackage,
};

export default agent;
