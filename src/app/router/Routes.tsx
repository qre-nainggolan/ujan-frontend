import { RouteObject, createBrowserRouter } from "react-router-dom";
import App from "../../App"; // ✅ your App component with ToastContainer
import PublicPage from "../../features/PublicPage";
import MainPage from "../../features/MainPage";
import Tryout from "../../features/simulation/Tryout";
import Package from "../../features/package/Package";

import PackageBank from "../../features/transaction/PackageBank";
import PurchasePackage from "../../features/package/PurchasePackage";
import PackageTest from "../../features/transaction/PackageTest";
import QuestionGrid from "../../features/admin/QuestionGrid";
import PackageGrid from "../../features/admin/PackageGrid";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <App />, // ✅ This wraps everything, including ToastContainer
    children: [
      { path: "", element: <PublicPage /> },
      { path: "MainPage", element: <MainPage /> },
      { path: "Tryout", element: <Tryout /> },
      { path: "Package", element: <Package /> },
      { path: "PackageBank", element: <PackageBank /> },
      { path: "PurchasePackage", element: <PurchasePackage /> },
      { path: "PackageTest", element: <PackageTest /> },
      { path: "QuestionGrid", element: <QuestionGrid /> },
      { path: "PackageGrid", element: <PackageGrid /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
