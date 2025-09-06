import { createBrowserRouter } from "react-router";
import MainLayout from "../layouts/MainLayout";
import ErrorPage from "../pages/ErrorPage/ErrorPage";
import HomePage from "../pages/homepage/HomePage";
import Login from "../pages/login/Login";
import SignUp from "../pages/registration/SignUp";
import PrivateRoute from "./PrivateRoute";
import Dashboard from "../layouts/Dashboard";
import Profile from "../pages/dashbooard/common/Profile";
import AdminRoutes from "./AdminRoutes";
import AddProduct from "../pages/dashbooard/admin/AddProduct";
import ManageProducts from "../pages/dashbooard/admin/ManageProducts";
import AdminAnalytics from "../pages/dashbooard/admin/AdminAnalytics";
import ManageOrders from "../pages/dashbooard/admin/ManageOrders";
import ManageUsers from "../pages/dashbooard/admin/ManageUsers";
import AllProducts from "../pages/allProducts/AllProducts";
import CartPage from "../pages/cart/CartPage";
import AboutUs from "../pages/aboutUs/AboutUs";
import Contact from "../pages/contact/Contact";
import UserRoutes from "./UserRoutes";
import Checkout from "../pages/cart/Checkout";
import OrderSuccess from "../components/order/OrderSuccess";
import MyOrders from "../pages/dashbooard/user/MyOrders";
import OrderDetails from "../pages/dashbooard/user/OrderDetails";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "all-products",
        element: <AllProducts />,
      },
      {
        path: "cart",
        element: (
          <PrivateRoute>
            <CartPage />
          </PrivateRoute>
        ),
      },
      {
        path: "about",
        element: <AboutUs />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "checkout",
        element: (
          <PrivateRoute>
            <UserRoutes>
              <Checkout />
            </UserRoutes>
          </PrivateRoute>
        ),
      },
      {
        path: "order-success",
        element: (
          <PrivateRoute>
            <UserRoutes>
              <OrderSuccess />
            </UserRoutes>
          </PrivateRoute>
        ),
      },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <SignUp /> },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
    children: [
      // ****common routes*****
      {
        index: true,
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      },

      {
        path: "profile",
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      },
      // ****ADMIN routes******
      {
        path: "add-product",
        element: (
          <PrivateRoute>
            <AdminRoutes>
              <AddProduct />
            </AdminRoutes>
          </PrivateRoute>
        ),
      },
      {
        path: "manage-products",
        element: (
          <PrivateRoute>
            <AdminRoutes>
              <ManageProducts />
            </AdminRoutes>
          </PrivateRoute>
        ),
      },
      {
        path: "admin-analytics",
        element: (
          <PrivateRoute>
            <AdminRoutes>
              <AdminAnalytics />
            </AdminRoutes>
          </PrivateRoute>
        ),
      },
      {
        path: "manage-order",
        element: (
          <PrivateRoute>
            <AdminRoutes>
              <ManageOrders />
            </AdminRoutes>
          </PrivateRoute>
        ),
      },
      {
        path: "manage-users",
        element: (
          <PrivateRoute>
            <AdminRoutes>
              <ManageUsers />
            </AdminRoutes>
          </PrivateRoute>
        ),
      },
      {
        path: "my-orders",
        element: (
          <PrivateRoute>
            <UserRoutes>
              <MyOrders />
            </UserRoutes>
          </PrivateRoute>
        ),
      },
      {
        path: "my-orders/:id",
        element: (
          <PrivateRoute>
            <OrderDetails />
          </PrivateRoute>
        ),
      },
    ],
  },
]);

export default router;
