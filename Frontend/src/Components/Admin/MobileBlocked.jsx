import { MonitorSmartphone, Laptop } from "lucide-react";
import { useNavigate } from "react-router-dom";


const MobileBlocked = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        sessionStorage.removeItem("userSession")
        navigate("/", { replace: true })
    }

    return (
        <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">

                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                        <MonitorSmartphone className="w-10 h-10 text-red-600" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-800">
                    Desktop Required
                </h1>

                <p className="mt-4 text-gray-600 leading-7">
                    The Administration Portal is not supported on mobile devices.
                    Please use a desktop or laptop for the best experience.
                </p>

                <button
                    onClick={handleLogout}
                    className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
                >
                    Logout
                </button>

            </div>
        </div>
    );
};

export default MobileBlocked;