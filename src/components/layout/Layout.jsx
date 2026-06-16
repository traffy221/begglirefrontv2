import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = () => {
  const { pathname } = useLocation();

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

  return (
    <div className="flex flex-col min-h-screen bg-ivory text-charcoal">
      {/* Editorial Premium Fixed Header */}
      <Header />

      {/* Main Content Area: Conditional padding-top so Home Page Hero covers the transparent header */}
      <main className={`flex-grow ${pathname === "/" ? "pt-0" : "pt-[112px]"}`}>
        <Outlet />
      </main>

      {/* Editorial Premium Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
