import { useState } from "react";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "../../../components/spinner/LoadingSpinner";
import SectionTitle from "../../../components/sectionTitle/SectionTitle";
import UpdateProfileModal from "../../../components/modal/UpdateProfileModal";

const Profile = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  // fetch profile data
  const {
    data: profile,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["profile", user?.email],
    queryFn: async () => {
      const { data } = await axiosSecure.get(`/user/${user.email}`);
      return data;
    },
    enabled: !!user?.email,
  });

  const { email, image, phone, address, name } = profile || {};

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col">
      {/* Page heading */}
      <div className="p-6">
        <SectionTitle heading="প্রোফাইল" />
      </div>

      {/* Main content */}
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl p-6 md:p-10 border border-green-200 ">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <img
                src={image}
                alt={name}
                className="w-40 h-40 rounded-full object-cover border-4 border-green-500 shadow-md"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* User Info */}
            <div className="flex-grow">
              <h2 className="noto-serif-bengali-normal text-3xl text-green-700 mb-4">
                {name}
              </h2>

              <p className="hind-siliguri-regular text-gray-700 text-lg mb-2">
                <span className="font-medium">ই-মেইল:</span> {email}
              </p>

              {phone && (
                <p className="hind-siliguri-regular text-gray-700 text-lg mb-2">
                  <span className="font-medium">ফোন:</span> {phone}
                </p>
              )}

              {address && (
                <p className="hind-siliguri-regular text-gray-700 text-lg mb-2">
                  <span className="font-medium">ঠিকানা:</span> {address}
                </p>
              )}

              {/* Update Button */}
              <button
                onClick={handleModalOpen}
                className="mt-4 hind-siliguri-medium bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl shadow-sm transition"
              >
                প্রোফাইল আপডেট করুন
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Update modal (Headless UI implementation) */}
      <UpdateProfileModal
        open={isModalOpen}
        onClose={handleModalClose}
        profile={profile}
        refetch={refetch}
      />
    </div>
  );
};

export default Profile;
