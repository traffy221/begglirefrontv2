import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ToastCart from "../book-detail/ToastCart";

const Layout = () => {
  const { pathname } = useLocation();
  const [activeToast, setActiveToast] = useState(null);

  // Scroll restoration on route changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant" // Instant is preferred for immediate route transitions
      });
    }
  }, [pathname]);

  // Cart toast notification event listener
  useEffect(() => {
    const handleShowToast = (e) => {
      setActiveToast(e.detail);
    };
    window.addEventListener("show-cart-toast", handleShowToast);
    return () => {
      window.removeEventListener("show-cart-toast", handleShowToast);
    };
  }, []);

  const isBloggerRoute = pathname.startsWith("/blogger");

  return (
    <div className="flex flex-col min-h-screen bg-ivory text-charcoal">
      {/* Editorial Premium Fixed Header */}
      {!isBloggerRoute && <Header />}

      {/* Main Content Area: Conditional padding-top so Home Page Hero covers the transparent header */}
      <main className={`flex-grow ${isBloggerRoute ? "pt-0" : pathname === "/" ? "pt-0" : "pt-[112px]"}`}>
        <Outlet />
      </main>

      {/* Editorial Premium Footer */}
      {!isBloggerRoute && <Footer />}

      {/* Global Toast Cart Notification */}
      {activeToast && (
        <ToastCart toast={activeToast} onClose={() => setActiveToast(null)} />
      )}
    </div>
  );
};

export default Layout;
