import { Routes, Route, Navigate } from "react-router-dom";
import SecurityCheckout from "../HostelPages/SecurityDashboard/SecurityCheckout";

const SecurityLayout = () => {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <Routes>
          <Route index element={<Navigate to="qrcheck" replace />} />
            <Route path="qrcheck" element={<SecurityCheckout />} />
          </Routes>
        </div>
      </div>
    );
  };
  
  export default SecurityLayout;