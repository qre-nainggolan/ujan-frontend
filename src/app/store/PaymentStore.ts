import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";

export interface PaymentStatusResponse {
  status: "PENDING" | "PAID" | "FAILED" | "NOT_FOUND";
}

export default class PaymentStore {
  status: "PENDING" | "PAID" | "FAILED" = "PENDING";
  checking: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  async checkStatus(merchantOrderId: string) {
    this.checking = true;
    try {
      const data = await agent.Purchase.checkStatus(merchantOrderId);

      console.log(data);
      console.log("data : " + data.status);

      runInAction(() => {
        if (data.status === "PAID") this.status = "PAID";
        else if (data.status === "FAILED") this.status = "FAILED";
        else this.status = "PENDING";
      });
    } catch (err) {
      console.error(err);
    } finally {
      runInAction(() => (this.checking = false));
    }
  }

  reset() {
    this.status = "PENDING";
    this.checking = false;
  }
}
