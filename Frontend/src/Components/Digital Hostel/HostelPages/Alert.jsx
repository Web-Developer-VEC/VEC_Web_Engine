import Swal from "sweetalert2";

const showSweetAlert = (title, text, icon = "info", confirmButtonText = "OK") => {
  Swal.fire({
    title,
    text,
    icon,
    confirmButtonText,
  });
};

export default showSweetAlert;