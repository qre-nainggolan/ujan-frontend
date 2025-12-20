import React from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../app/store/store";
import "../../css/payment.css";

const PaymentResultPage: React.FC = () => {
  const { PaymentStore } = useStore();
  const navigate = useNavigate();

  const getMessage = () => {
    if (PaymentStore.status === "PENDING")
      return "Menunggu konfirmasi pembayaran...";
    if (PaymentStore.status === "PAID") return "Pembayaran Anda Berhasil!";
    return "Pembayaran Gagal";
  };

  const handleReturn = () => navigate("/Package");

  return (
    <div className="payment-container">
      <div className={`payment-card ${PaymentStore.status.toLowerCase()}`}>
        <h1 className="title">{getMessage()}</h1>
        {PaymentStore.status === "PENDING" && <div className="loader" />}
        {PaymentStore.status === "PAID" && (
          <div className="success-checkmark">&#10003;</div>
        )}
        {PaymentStore.status === "FAILED" && (
          <div className="failed-x">&#10005;</div>
        )}
        {/* <div className="details">
          <p>
            <strong>Order ID:</strong> {merchantOrderId}
          </p>
          <p>
            <strong>Reference:</strong> {reference}
          </p>
        </div> */}

        <button className="return-btn" onClick={handleReturn}>
          Kembali ke Daftar Paket
        </button>
      </div>
    </div>
  );
};

export default PaymentResultPage;
