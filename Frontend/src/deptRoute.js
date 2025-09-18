import { useParams, Navigate } from "react-router-dom";
import AdminDepartmentPage from "./Components/Admin/Top_Nav_Bar/Academics/DepartmentPage";
import DepartmentPage from "./Components/Main/Top_Nav_Bar/Academics/DepartmentPage";

const DepartmentRoute = ({ session, toggle, theme }) => {
  const { deptID } = useParams();

  if (!session) return <DepartmentPage toggle={toggle} theme={theme} />;

  if (session.routes.includes(`/dept/${deptID}`)) {
    return <AdminDepartmentPage toggle={toggle} theme={theme} />;
  }

  return <Navigate to="/admin_profile" replace />;
};

export default DepartmentRoute;