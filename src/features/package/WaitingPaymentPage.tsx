import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useStore } from "../../app/store/store";
import "../../css/payment.css";

export default observer(function WaitingPaymentPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { PaymentStore } = useStore();

  const orderId = params.get("merchantOrderId");

  useEffect(() => {
    if (!orderId) return;

    PaymentStore.reset();

    // Poll every 3 seconds
    const interval = setInterval(() => {
      PaymentStore.checkStatus(orderId);
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId]);

  // When PAID, redirect to success screen
  useEffect(() => {
    if (PaymentStore.status === "PAID") {
      setTimeout(() => navigate("/PaymentResult"), 800);
    }

    if (PaymentStore.status === "FAILED") {
      setTimeout(() => navigate("/PaymentResult"), 800);
    }
  }, [PaymentStore.status]);

  return (
    <div className="waiting-container">
      <div className="waiting-card">
        <h1 className="waiting-title">Menunggu Pembayaran...</h1>

        <div className="waiting-spinner"></div>

        <p className="waiting-sub">
          Silakan selesaikan pembayaran Anda melalui QRIS atau Virtual Account.
        </p>

        <p className="waiting-order">
          <strong>Order ID:</strong> {orderId}
        </p>

        <p className="waiting-status">
          Status Saat Ini: <span>{PaymentStore.status}</span>
        </p>

        <button className="cancel-btn" onClick={() => navigate("/Package")}>
          Batalkan & Kembali
        </button>
      </div>
    </div>
  );
});
