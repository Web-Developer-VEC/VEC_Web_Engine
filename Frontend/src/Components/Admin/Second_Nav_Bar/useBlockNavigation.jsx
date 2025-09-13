import { useEffect, useContext } from "react";
import { UNSAFE_NavigationContext } from "react-router-dom";

const useBlockNavigation = (block) => {
  const { navigator } = useContext(UNSAFE_NavigationContext);

  useEffect(() => {
    if (!block) return;

    // ✅ Handle browser refresh / close
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ""; // required for Chrome
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // ✅ Handle React Router navigation
    const originalPush = navigator.push;
    navigator.push = (...args) => {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (confirmLeave) {
        originalPush.apply(navigator, args);
      }
    };

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      navigator.push = originalPush; // restore
    };
  }, [block, navigator]);
};

export default useBlockNavigation;
