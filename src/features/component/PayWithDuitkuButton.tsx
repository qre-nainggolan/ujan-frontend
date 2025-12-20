// src/components/PayWithDuitkuButton.tsx
import React, { useState } from "react";
import agent from "../../app/api/agent";
import { PurchaseInterface } from "../../app/model/LoginInterface";
import { useNavigate } from "react-router-dom";

interface PayWithDuitkuButtonProps {
  packageId_: string;
  packageName_: string;
  priceIdr: number;
}

interface CreatePaymentResponse {
  paymentUrl: string;
  merchantOrderId: string;
  reference: string;
  statusCode: string;
  statusMessage: string;
}

const PayWithDuitkuButton: React.FC<PayWithDuitkuButtonProps> = ({
  packageId_,
  packageName_,
  priceIdr,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const purchaseInterface_: PurchaseInterface = {
    packageId: packageId_,
    packageName: packageName_,
  };

  const navigate = useNavigate();

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    try {
      agent.Purchase.create(purchaseInterface_).then(
        (res: CreatePaymentResponse) => {
          if (res.statusCode !== "00") {
            throw new Error(res.statusMessage || "Failed to create payment");
          }

          if (res.statusCode !== "00" || !res.paymentUrl) {
            throw new Error(res.statusMessage || "Duitku error");
          }

          window.open(res.paymentUrl, "_blank");
          navigate(`/WaitingPage?merchantOrderId=${res.merchantOrderId}`);
        }
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "0.5rem" }}>
      <button
        onClick={handlePay}
        disabled={loading}
        style={{
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          borderRadius: "999px",
          border: "none",
          cursor: loading ? "default" : "pointer",
          backgroundColor: "#00880d",
          color: "white",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        {loading
          ? "Processing..."
          : `Bayar sekarang (Rp ${priceIdr.toLocaleString("id-ID")})`}
      </button>
      {error && (
        <p style={{ color: "red", marginTop: "0.5rem", fontSize: "0.875rem" }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default PayWithDuitkuButton;
