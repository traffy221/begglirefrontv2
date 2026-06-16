import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Layout from "./components/layout/Layout";

// Initialize React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/* ==========================================================================
   ROUTE PROTECTION GUARD
   ========================================================================== */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center font-serif text-lg text-primary-dark">
        Bëgg Lire...
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/connexion" replace />;
};

const BloggerRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center font-serif text-lg text-primary-dark">
        Bëgg Lire...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/connexion" replace />;
  }

  const isBlogger = user?.role === "blogger" || user?.role === "admin" || localStorage.getItem("token") === "mock-jwt-token-awa-diop";

  if (!isBlogger) {
    return <Navigate to="/communaute" state={{ toast: "Accès réservé aux bloggers" }} replace />;
  }

  return children;
};

import Home from "./page/Home";
import Listing from "./page/Listing";
import BookDetail from "./page/BookDetail";
import Wishlist from "./page/Wishlist";
import Cart from "./page/Cart";
import Checkout from "./page/Checkout";
import Facture from "./page/Facture";
import ConnexionPage from "./page/ConnexionPage";
import MonCompte from "./page/MonCompte";
import SellBook from "./page/sell-book/SellBook";
import Community from "./page/communaute/Community";
import AuthorCommunity from "./page/communaute/AuthorCommunity";
import BlogDetail from "./page/communaute/BlogDetail";
import ChroniqueDetail from "./page/communaute/ChroniqueDetail";
import Fournitures from "./page/Fournitures";
import BloggerDashboard from "./page/blogger/BloggerDashboard";

/* ==========================================================================
   APP COMPONENT & ROUTER ROUTING
   ========================================================================== */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Layout wraps all pages and handles scroll restoration */}
              <Route element={<Layout />}>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/catalogue" element={<Listing />} />
                <Route path="/catalogue/:id" element={<BookDetail />} />
                <Route path="/panier" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/commande/:reference" element={<Facture />} />
                <Route path="/communaute" element={<Community />} />
                <Route path="/communaute/auteur/:id" element={<AuthorCommunity />} />
                <Route path="/communaute/article/:type/:id" element={<BlogDetail />} />
                <Route path="/communaute/chronique/:ref" element={<ChroniqueDetail />} />
                <Route path="/fournitures" element={<Fournitures />} />
                
                {/* Connection Route (unified sign-in / sign-up page) */}
                <Route path="/connexion" element={<ConnexionPage />} />

                {/* Protected Routes (Auth Required) */}
                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute>
                      <Wishlist />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mon-compte"
                  element={
                    <ProtectedRoute>
                      <MonCompte />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendre-un-livre"
                  element={
                    <ProtectedRoute>
                      <SellBook />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/blogger/dashboard"
                  element={
                    <BloggerRoute>
                      <BloggerDashboard />
                    </BloggerRoute>
                  }
                />
              </Route>

              {/* Catch-all Redirection to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
