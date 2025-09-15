import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../../css/card.css";
import agent from "../../app/api/agent";
import "../../css/style2.css";
import "../../css/form.css";

import NavLane from "../../NavLane";
import Header from "../../Header";
import { ListUserPackage } from "../../app/model/ListPackage";

type PackageDetail = {
  id: string;
  package_id: string;
  name: string;
  final_price: number;
  description: string;
};

export default function PurchasePage() {
  const [popupClass] = useState("popup");
  const [params] = useSearchParams();
  const [pkg, setPkg] = useState<PackageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const navigate = useNavigate();

  const packageId = params.get("package");

  useEffect(() => {
    if (!packageId) return;

    agent.Package.getPackage()
      .then((response: ListUserPackage[]) => {
        const found = response.find((p) => p.package_id === packageId);
        if (found) setPkg(found); // <- now TypeScript knows found is ListUserPackage | undefined
      })
      .catch((err) => {
        console.error("Failed to load packages", err);
      })
      .finally(() => setLoading(false));
  }, [packageId]);

  const handlePurchase = () => {
    if (!pkg) return;

    agent.Package.purcahsePackage(
      { package_id: pkg.package_id },
      pkg.package_id
    )
      .then(() => {
        setConfirmed(true);
      })
      .catch((err) => {
        console.error("Failed to load packages", err);
      })
      .finally(() => {
        setTimeout(() => navigate("/Package"), 3000);
      });
  };

  if (loading || !pkg)
    return <div className="purchase-loading">Loading...</div>;

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
              <p className="purchase-title">Paket: {pkg.name}</p>

              <div className="purchase-detail-box">
                <p>
                  <strong>Deskripsi:</strong> {pkg.description}
                </p>
                <p>
                  <strong>Harga:</strong>
                  <br />
                  <span className="price">
                    Rp {pkg.final_price.toLocaleString()}
                  </span>
                </p>
              </div>

              <div className="purchase-form">
                <label htmlFor="name">
                  Masukan Kupon / Kode Promo (jika ada)
                </label>
                <input
                  type="text"
                  id="name"
                  className="purchase-input"
                  placeholder="Contoh: Coba Coba"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={confirmed}
                />

                <button
                  className={`purchase-button ${confirmed ? "confirmed" : ""}`}
                  onClick={handlePurchase}
                  disabled={!name || confirmed}
                >
                  {confirmed ? "Pembayaran Berhasil ✓" : "Bayar Sekarang"}
                </button>

                {confirmed && (
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
      <footer className="layout__footer">
        &copy; 2025 Digital Transformation
      </footer>
      <div id="popup" className={popupClass}>
        <div className="popup__content">
          <span className="popup__close">&times;</span>
          <div id="curveChart" className="popup__chart"></div>
        </div>
      </div>
    </div>
  );
}
