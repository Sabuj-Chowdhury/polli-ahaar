import { Outlet } from "react-router";
import SideBar from "../components/sidebar/SideBar";

const Dashboard = () => {
  return (
    <div className="flex ">
      {/* dashboard links */}
      <SideBar />
      {/* outlet */}
      <div className="w-full">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
