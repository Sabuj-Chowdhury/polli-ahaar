import { Outlet } from "react-router";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";

const MainLayout = () => {
  return (
    <main className="overflow-x-hidden">
      {/* navbar */}
      <Navbar />

      {/* outlet */}
      <div className="min-h-[calc(100vh-353px)]">
        <Outlet />
      </div>
      {/* footer */}
      <Footer />
    </main>
  );
};

export default MainLayout;
