import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);

  const getInitials = (fullName) => {
    if (!fullName) return "";
    const names = fullName.split(" ");
    let initials = names[0].charAt(0);
    if (names.length > 1) {
      initials += names[1].charAt(0);
    }
    return initials.toUpperCase();
  };

  return (
    <>
      <div className="w-full my-10 md:mx-auto max-w-7xl bg-white p-4 md:p-10 rounded-xl md:shadow-sm">
        <h2 className="text-3xl text-start font-semibold text-gray-800 mb-10">
          My Profile
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left Section: Avatar + Edit Button */}
          <div className="flex flex-col items-center">
            {/* <div className="w-48 h-48 rounded-full overflow-hidden shadow-md mb-5">
              <img
                className="w-full h-full object-cover"
                src={getInitials(user.name)}
                alt="profile avatar"
              />
            </div> */}

            {user.avatar ? (
              <div className="h-48 w-48 rounded-full overflow-hidden shadow-sm mb-5">
                <img
                  className="h-full w-full object-cover"
                  src={user.avatar.url}
                  alt="Avatar"
                />
              </div>
            ) : (
              <div className="h-48 w-48 flex items-center justify-center rounded-full shadow-sm bg-[#D7A3FF] font-semibold text-[#480A4C] text-[4rem] mb-5">
                {getInitials(user.name)}
              </div>
            )}

            <Link
              to="/edit-profile"
              className="w-40 shadow-sm text-center text-[16px] bg-[#4F1F4E] text-white py-2 rounded-lg font-normal hover:bg-[#6e3b72] transition"
            >
              Edit Profile
            </Link>
          </div>

          {/* Right Section: User Info */}
          <div className="space-y-6">
            <div>
              <h4 className="text-[24px] font-semibold text-[#808080]">
                Full Name
              </h4>
              <p className="text-gray-900 text-[18px]">{user?.name}</p>
            </div>

            <div>
              <h4 className="text-[24px] font-semibold text-[#808080]">
                Email Address
              </h4>
              <p className="text-gray-900 text-[18px]">{user?.email}</p>
            </div>

            <div>
              <h4 className="text-[24px] font-semibold text-[#808080]">
                Joined On
              </h4>
              <p className="text-gray-900 text-[18px]">
                {String(user?.createdAt).substring(0, 10)}
              </p>
            </div>

            <div className="flex gap-4 mt-6">
              <Link
                to="/orders"
                className="w-full text-[16px] text-center shadow-sm bg-[#f9f9f9] text-[#4F1F4E] py-2 rounded-lg font-normal hover:bg-[#e9e8e8] transition"
              >
                My Orders
              </Link>

              <Link
                to="/change-password"
                className="w-full text-[16px] shadow-sm text-center bg-[#28D5F3] text-white py-2 rounded-lg font-normal hover:bg-[#00C6D1] transition"
              >
                Change Password
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
