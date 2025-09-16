import { routeConfig } from "./routeConfig";
import { Navigate } from "react-router-dom";

export const getRouteElement = (path, session, toggle, theme) => {
  const config = routeConfig[path];
  if (!config) return null;

  const NormalComp = config.normal;
  const AdminComp = config.admin;

  // No session → normal
  if (!session) return <NormalComp toggle={toggle} theme={theme} />;

  // Session and allowed
  if (session.routes.includes(path)) {
    return AdminComp 
      ? <AdminComp toggle={toggle} theme={theme} />
      : <NormalComp toggle={toggle} theme={theme} />;
  }

  // Session but not allowed → normal
  // return <NormalComp toggle={toggle} theme={theme} />;
  return <Navigate to="/admin_profile" replace />
};