import "../css/style2.css";
import "../css/table.css";
import "../css/grid.css";
import { useEffect, useState } from "react";
import NavLane from "../NavLane";
import Header from "../Header";
import Footer from "../Footer";
import DataGrid from "./component/DataGrid";
import { observer } from "mobx-react-lite";
import { useStore } from "../app/store/store";

// export default observer(function MainPage() {
export default observer(function MainPage() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { UserStore } = useStore();
  const {
    listUserScore,
    loadUserScore,
    currentPage,
    totalPages,
    totalData,
    pageSize,
    setPageSize,
  } = UserStore;

  const scoreColumns = [
    {
      header: "#",
      key: "index",
      render: (_row: any, i: number) => i + 1 + (currentPage - 1) * pageSize,
      align: "right" as const,
    },
    {
      header: "Tanggal",
      key: "started_at",
      width: 170,
      render: (row: any) => {
        const d = row.started_at ? new Date(row.started_at) : null;
        return d && !isNaN(d.getTime())
          ? d.toLocaleString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "UTC",
            })
          : "-";
      },
    },
    { header: "Total", key: "total" },
    { header: "Benar", key: "correct" },
    {
      header: "Score",
      key: "correct",
      render: (row: any) =>
        row.total ? ((row.correct / row.total) * 100).toFixed(1) : "0.0",
    },
  ];

  // const
  useEffect(() => {
    loadUserScore("", 1);
    console.table(listUserScore);
  }, []);

  return (
    <>
      <div className="layout">
        <Header />
        <div className="layout__body">
          <NavLane />
          <main className="layout__main">
            <div className="top-banner">
              <div>
                <h2>Halo, </h2>

                <p className="page-subtitle">
                  Ini adalah ringkasan nilai ujian terbaru Anda. Lihat progres
                  nilai Anda dari waktu ke waktu
                </p>
              </div>
              <div className="chip-row">
                <div className="chip">
                  Total Simulasi Gratis: <b>{listUserScore.length}</b>
                </div>
                <div className="chip">
                  Average Score: <b>63.5%</b>
                </div>
                <div className="chip">
                  Best Score: <b>95%</b>
                </div>
              </div>
            </div>
            <div className="section-divider"></div>

            <DataGrid
              data={listUserScore || []}
              columns={scoreColumns}
              selectedIndex={selectedIndex}
              onRowClick={(_, i) => setSelectedIndex(i)}
              currentPage={currentPage}
              totalPages={totalPages}
              totalRecords={totalData}
              pageSize={pageSize}
              onPageChange={(newPage) => {
                loadUserScore("", newPage);
              }}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                loadUserScore("", 1);
              }}
            />
          </main>
        </div>
        <Footer />
      </div>
    </>
  );
});
