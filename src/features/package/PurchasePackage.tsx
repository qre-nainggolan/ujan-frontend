import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import NavLane from "../../NavLane";
import Header from "../../Header";

import "../../css/card.css";
import "../../css/style2.css";
import "../../css/form.css";

import { useStore } from "../../app/store/store";
import Footer from "../../Footer";

export default observer(function PackageBank() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { PurchasePackageStore } = useStore();

  const {
    packageDetail,
    purchaseLoading,
    purchaseName,
    purchaseConfirmed,
    setField,
    loadPackageDetail,
    purchasePackage,
  } = PurchasePackageStore;

  const packageId = params.get("package");

  useEffect(() => {
    if (!packageId) return;
    else loadPackageDetail(packageId);
  }, [packageId]);

  const handlePurchase = async () => {
    if (!packageId) return;
    await purchasePackage(packageId);
    setTimeout(() => navigate("/Package"), 3000);
  };

  if (purchaseLoading) {
    return <div className="purchase-loading">Loading...</div>;
  }

  if (!packageDetail) {
    return <div>Paket tidak ditemukan.</div>;
  }

  return (
    <div className="layout">
      <Header />
      <div className="layout__body">
        <NavLane />
        <main className="layout__main">
          <h1>Packets</h1>

          <div className="purchase-wrapper">
            <div className="purchase-card">
              <h1 className="purchase-title">Konfirmasi Pembelian</h1>
              <p className="purchase-title">Paket: {packageDetail!.name}</p>

              <div className="purchase-detail-box">
                <p>
                  <strong>Deskripsi:</strong> {packageDetail!.description}
                </p>
                <p>
                  <strong>Harga:</strong>
                  <br />
                  <span className="price">
                    Rp {packageDetail!.final_price.toLocaleString()}
                  </span>
                </p>
              </div>

              <div className="purchase-form">
                <label htmlFor="name">
                  Masukan Kupon / Kode Promo (jika ada)
                </label>
                <input
                  id="name"
                  className="purchase-input"
                  value={purchaseName}
                  onChange={(e) => setField("purchaseName", e.target.value)}
                  disabled={purchaseConfirmed}
                />

                <button
                  className={`purchase-button ${
                    purchaseConfirmed ? "confirmed" : ""
                  }`}
                  onClick={handlePurchase}
                  disabled={!purchaseName || purchaseConfirmed}
                >
                  {purchaseConfirmed
                    ? "Pembayaran Berhasil ✓"
                    : "Bayar Sekarang"}
                </button>

                {purchaseConfirmed && (
                  <p className="purchase-success">
                    Terima kasih! Pembelian berhasil. Mengalihkan ke halaman
                    paket...
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
});
