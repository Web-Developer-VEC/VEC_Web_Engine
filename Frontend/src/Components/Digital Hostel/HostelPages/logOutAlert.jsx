import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import showSweetAlert from "./showSweetAlert";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: "Logging out...",
      text: "You will be redirected to the login page.",
      icon: "warning",
      showConfirmButton: false,
      timer: 1500, // Auto-close in 1.5 sec
      didClose: () => {
        // Clear user session or token
        localStorage.removeItem("userToken");

        // Ensure the modal is closed before redirecting
        Swal.close();
        
        // Redirect to login
        navigate("/login");
      },
    });
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;
