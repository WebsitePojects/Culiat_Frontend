import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component - scrolls to top on route change
 * Place this inside the Router component in App.jsx
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
