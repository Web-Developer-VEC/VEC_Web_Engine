import { Button } from "../Button";
import { FaSignInAlt } from "react-icons/fa";
import Banner from "../Banner";

export default function HostelPage() {
  return (
    <>
          <Banner
        backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
        headerText="VEC Hostel"
        subHeaderText="A home away from home, where comfort meets community and learning thrives in a peaceful, secure environment"
      />
    <div className="min-h-screen bg-white flex flex-col items-center p-6">
      {/* Admissions Section at the Top */}
      <div className="w-full bg-gradient-to-r from-yellow-500 to-yellow-700 p-16 rounded-3xl shadow-2xl text-center text-white">
        <h2 className="text-5xl font-extrabold drop-shadow-lg">Admissions Open</h2>
        <p className="mt-6 text-xl max-w-3xl mx-auto">
          Enroll now to experience world-class hostel facilities. Secure your spot today and be a part of our vibrant campus life!
        </p>
        <div className="mt-8 flex justify-center gap-6">
          <Button className="bg-black text-yellow-400 px-8 py-4 rounded-xl shadow-lg hover:bg-gray-800 transition duration-300 text-xl">
            Apply Now
          </Button>
          <Button className="bg-red-600 text-white px-8 py-4 rounded-xl shadow-lg hover:bg-red-700 transition duration-300 text-xl">
            Fee Payment
          </Button>
        </div>
      </div>

      {/* Hostel Content Section */}
      <div className="flex flex-col md:flex-row bg-gray-50 p-16 rounded-3xl shadow-2xl w-full max-w-7xl border-4 border-red-500 mt-12">
        <div className="flex-1 text-black">
          <h1 className="text-6xl font-extrabold text-brown-700">Hostel Facilities</h1>
          <p className="mt-8 text-2xl text-gray-700 leading-relaxed">
            Our hostel provides a comfortable and secure living environment with
            spacious rooms, high-speed internet, 24/7 security, and hygienic
            dining facilities. Designed to enhance student life, our hostel
            ensures a peaceful atmosphere for focused learning and relaxation.
            We prioritize student well-being, offering recreational areas,
            study lounges, and a community-driven environment to foster
            learning and personal growth.
          </p>
        </div>
        <img
          src="/hostel-image.jpg"
          alt="Hostel Facilities"
          className="w-1/2 rounded-3xl shadow-xl ml-8 hidden md:block"
        />
      </div>

      {/* Hostel Management System Login Section */}
      <div className="w-full flex flex-col md:flex-row items-center justify-center mt-16 text-center md:text-left bg-opacity-50 backdrop-blur-lg p-8 rounded-xl shadow-lg">
        <h2 className="text-4xl font-semibold text-black mb-4 md:mb-0 md:mr-6 border-b-4 border-yellow-500 pb-2">
          Hostel Management System Login
        </h2>
        <Button className="bg-yellow-500 text-black flex items-center gap-2 px-8 py-4 rounded-xl shadow-lg hover:bg-yellow-600 transition duration-300 text-xl">
          <FaSignInAlt className="text-3xl" /> Login
        </Button>
      </div>
    </div>
    </>
  );
}
