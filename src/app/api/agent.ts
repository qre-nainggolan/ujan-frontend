import axios, { AxiosResponse } from "axios";
import {
  LoginInterface,
  User,
  PurchaseInterface,
} from "../model/LoginInterface";
import { store } from "../store/store";
import { UserProfile } from "../model/UserProfile";
import { PostResponse } from "../model/PostResponse";
import { RegistrationDataSubmissionValue } from "../model/RegistrationDataSubmission";
import { ListUserScore } from "../model/ListUserScore";
import { ListUserPackage } from "../model/ListPackage";
import { ListProgressSummaryResponse } from "../model/ListProgressSummary";
import { PaymentStatusResponse } from "../store/PaymentStore";

interface SubmitAnswerRequest {
  sessionId: string;
  questionId: number;
  questionNumber: number;
  answer: string;
}

interface TryoutResponse {
  sessionId: string;
  timeLeft: number;
  isLast: boolean;
  totalQuestion: number;
  done: boolean;
  question: {
    id: number;
    questionNumber: number;
    text: string;
    done: boolean;
    image: string;
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
  questionNumber: number;
  answer: string;
};

type PackageDetail = {
  package_id: string;
};

interface CreatePaymentResponse {
  paymentUrl: string;
  merchantOrderId: string;
  reference: string;
  statusCode: string;
  statusMessage: string;
}

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

// axios.defaults.baseURL = import.meta.env.VITE_API_URL;
// axios.defaults.baseURL = "https://api.lulusku.com/api";
axios.defaults.baseURL =
  import.meta.env.VITE_API_URL;

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 403) {
      window.location.href = "/MainPage";
    }
    return Promise.reject(err);
  }
);

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

const Purchase = {
  create: (package_: PurchaseInterface) =>
    requests.post<CreatePaymentResponse>(`/payments/duitku/create`, package_),
  checkStatus: (orderId: string) =>
    requests.get<PaymentStatusResponse>(
      `/payments/duitku/status?orderId=${orderId}`
    ),
};

const Account = {
  login: (user: LoginInterface) => requests.post<User>(`/account/login`, user),
  logout: (): Promise<AxiosResponse<any>> => axios.post(`/account/logout`),
  getUserProfile: (): Promise<AxiosResponse<UserProfile>> =>
    axios.get(`/account/get-user-profile`),
  submitRegistration_: (params: RegistrationDataSubmissionValue) =>
    requests.post<PostResponse>(`/account/submitRegistration`, params),
  // inside Account object in agent.ts
  submitRegistration: (body: RegistrationDataSubmissionValue) =>
    requests.post<any>("/account/register", body),
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
  startTryout: (
    packageId: string,
    sub: string
  ): Promise<AxiosResponse<TryoutResponse>> =>
    axios.get(`/ujantest/start-tryout?packageId=${packageId}&sub=${sub}`),
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
  startTest: (
    packageId: string,
    sub: string
  ): Promise<AxiosResponse<TryoutResponse>> =>
    axios.get(`/userpackage/start-test?packageId=${packageId}&sub=${sub}`),
  checkSessionExists: (sessionId: string) =>
    axios.get("/userpackage/check-session-exists", { params: { sessionId } }),
  continueTest: (
    sessionId: string,
    lastQuestionId: number,
    package_id: string,
    sub: string
  ): Promise<AxiosResponse<TryoutResponse>> =>
    axios.get(
      `/userpackage/continue-test?sessionId=${sessionId}&lastQuestionId=${lastQuestionId}&package_id=${package_id}&sub=${sub}`
    ),
  getSubtest(packageId: string) {
    return axios.get(`/userpackage/get-subtest?packageId=${packageId}`);
  },
  purcahsePackage: (params: PackageDetail, package_id: string) =>
    requests.post<PostResponse>(
      `/userpackage/purchase-package?package_id=${package_id}`,
      params
    ),
  checkQuestion: (
    sessionId: string,
    lastQuestionId: number,
    questionNumber: number
  ): Promise<AxiosResponse<TryoutResponse>> =>
    axios.get(
      `/userpackage/check-question?sessionId=${sessionId}&lastQuestionId=${lastQuestionId}&questionNumber=${questionNumber}`
    ),
  goIntoQuestion: (
    sessionId: string,
    lastQuestionId: number,
    package_id: string,
    sub: string
  ): Promise<AxiosResponse<TryoutResponse>> =>
    axios.get(
      `/userpackage/go-into-question?sessionId=${sessionId}&lastQuestionId=${lastQuestionId}&package_id=${package_id}&sub=${sub}`
    ),
  getPackageInformation: (
    packageID: string,
    sub: string
  ): Promise<AxiosResponse<any>> =>
    axios.get(
      `/userpackage/get-package-information?Package_ID=${packageID}&sub=${sub}`
    ),
  getPurchasedPackage: (): Promise<AxiosResponse<any>> =>
    axios.get(`/userpackage/get-purchased-package`),
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
  getPackage: () =>
    axios.get<ListUserPackage[]>(`/userpackage/get-package`).then(responseBody),
  getPackageTest: (): Promise<any[]> => {
    return axios.get(`/package/get-package`).then((res) => {
      console.log("📦 Raw response from /userpackage/get-package:", res);
      return res.data;
    });
  },
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
  getProgressSummary: (
    keyword_: string,
    currentPage: number,
    pageSize: number
  ): Promise<AxiosResponse<ListProgressSummaryResponse>> =>
    axios
      .get(
        `/ujanscore/get-progress-summary?keyword=${keyword_}&page=${currentPage}&limit=${pageSize}`
      )
      .then(responseBody),
};

const Package = {
  getListMainPackage: (): Promise<AxiosResponse<any>> =>
    axios.get(`/package/get-list-main-package`),
  getListTypePackage: (package_id: string): Promise<AxiosResponse<any>> =>
    axios.get(`/package/get-list-type-package?package_id=${package_id}`),
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
        `/package/get-paginated-question-list?package_id=${package_id}&sub=${category}&start=${startDate}&end=${endDate}&page=${currentPage}&limit=${pageSize}`
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
  submitQuestion: (formData: FormData) =>
    axios.post(`/package/submit-question`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

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
  Purchase,
};

export default agent;
