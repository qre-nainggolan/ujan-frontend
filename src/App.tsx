import { Outlet } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  return (
    <>
      <Outlet />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </>
  );
}
export default observer(App);
