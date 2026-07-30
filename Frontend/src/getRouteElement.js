import { routeConfig } from "./routeConfig";
import { Navigate, matchPath } from "react-router-dom";

export const getRouteElement = (path, session, toggle, theme) => {
  const config = routeConfig[path];
  if (!config) return null;

  const NormalComp = config.normal;
  const AdminComp = config.admin;

  // No session → normal
  if (!session) return <NormalComp toggle={toggle} theme={theme} />;

  const isAllowed = path === "/admin_profile" || session.routes.some((allowedRoute) => {
    const match = matchPath({ path }, allowedRoute);
    return match !== null;
  });

  // Session and allowed
  if (isAllowed) {
    return AdminComp 
      ? <AdminComp toggle={toggle} theme={theme} session={session} />
      : <NormalComp toggle={toggle} theme={theme} />;
  }

  // Session but not allowed → normal
  // return <NormalComp toggle={toggle} theme={theme} />;
  return <Navigate to="/admin_profile" replace />
};