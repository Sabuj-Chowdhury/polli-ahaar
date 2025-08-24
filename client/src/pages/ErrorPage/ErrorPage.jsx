import { Link } from "react-router";
import errorImage from "../../assets/error.jpg";

const ErrorPage = () => {
  return (
    <section className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center p-4">
      <img
        src={errorImage}
        alt="Error"
        className="mb-6 w-1/2 md:w-1/3 lg:w-1/4"
      />
      <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
      <h2 className="text-3xl font-semibold mb-2">Oops! Page Not Found</h2>
      <p className="text-lg mb-4">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="bg-teal-700 text-white px-4 py-2 rounded hover:bg-teal-600 transition"
      >
        Go Back to Home
      </Link>
    </section>
  );
};

export default ErrorPage;
