import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useBookDetail } from "../hooks/useQueries";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import apiClient from "../api/client";

// Modular Subcomponents
import HeroBook from "../components/book-detail/HeroBook";
import BookDescription from "../components/book-detail/BookDescription";
import BookReviews from "../components/book-detail/BookReviews";
import RelatedBooks from "../components/book-detail/RelatedBooks";

export default function BookDetail() {
  const { id } = useParams();
  const { user, isAuthenticated, refreshWishlistCount } = useAuth();
  const { addItem } = useCart();

  // Queries
  const { data: bookResponse, isLoading: bookLoading, error: bookError } = useBookDetail(id);
  const book = bookResponse?.data || bookResponse;

  // De-duplicated view registration on mount
  useEffect(() => {
    if (id) {
      apiClient.post(`/livre-en-vente/${id}/vue`).catch(() => {
        // Fail silently to prevent disrupting user experience
      });
    }
  }, [id]);

  // Loading State: High fidelity pulse skeleton
  if (bookLoading) {
    return <BookDetailSkeleton />;
  }

  // Error / 404 State: Premium custom card
  if (bookError || !book) {
    const errorMsg = bookError?.response?.data?.message || "Le volume demandé est introuvable ou n'est plus proposé à la vente.";
    return <BookDetailError message={errorMsg} />;
  }

  return (
    <div className="w-full min-h-screen bg-ivory">
      {/* 1. Viewport Hero Backdrop */}
      <HeroBook
        book={book}
        addItem={addItem}
        isAuthenticated={isAuthenticated}
        refreshWishlistCount={refreshWishlistCount}
      />

      {/* 2. Expandable Book Description, Quotes & Technical Details */}
      <BookDescription book={book} />

      {/* 3. Ratings Breakdown & Interactive Reviews Form */}
      <BookReviews bookId={book.id} user={user} />

      {/* 4. Horizontal Recommendations Carousel */}
      <RelatedBooks currentBookId={book.id} />
    </div>
  );
}

// ==========================================================================
// LOADING SKELETON COMPONENT
// ==========================================================================
function BookDetailSkeleton() {
  return (
    <div className="w-full space-y-12 bg-ivory pb-20 select-none animate-pulse">
      {/* Hero layout skeleton */}
      <div className="bg-[#1c380e]/95 py-20 px-6 md:px-12 min-h-[70vh] flex items-center justify-center">
        <div className="container mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Cover placeholder */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-[280px] sm:w-[320px] h-[400px] bg-white/10 rounded-2xl border-4 border-white/5 shadow-inner" />
          </div>
          {/* Metadata placeholders */}
          <div className="lg:col-span-7 space-y-6 text-white/40">
            <div className="h-3 bg-white/20 rounded w-1/4" />
            <div className="h-10 bg-white/25 rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-white/20 rounded w-1/3" />
            <div className="h-8 bg-white/25 rounded w-1/4" />
            <div className="space-y-3 pt-6 border-t border-white/10 max-w-md">
              <div className="h-4 bg-white/10 rounded w-1/2" />
              <div className="h-12 bg-white/20 rounded-xl w-full" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Description details skeleton */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-6">
          <div className="h-6 bg-gray/10 rounded w-1/3" />
          <div className="space-y-2">
            <div className="h-4 bg-gray/10 rounded w-full" />
            <div className="h-4 bg-gray/10 rounded w-full" />
            <div className="h-4 bg-gray/10 rounded w-5/6" />
          </div>
        </div>
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-primary-soft/10 h-64" />
      </div>
    </div>
  );
}

// ==========================================================================
// ERROR / 404 STATE COMPONENT
// ==========================================================================
function BookDetailError({ message }) {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-6 text-center space-y-6 select-none bg-ivory">
      <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 border border-rose-500/20 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <div className="space-y-2 max-w-md">
        <h2 className="font-serif text-3xl font-bold text-charcoal">
          Volume introuvable
        </h2>
        <p className="text-gray text-xs md:text-sm leading-relaxed">
          {message}
        </p>
      </div>
      <Link
        to="/catalogue"
        className="inline-flex items-center space-x-2 bg-[#1c380e] hover:bg-[#2c4e1d] text-white font-poppins font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-xs active:scale-95"
      >
        <span>Retour au catalogue</span>
      </Link>
    </div>
  );
}
