import BookCardGrid from "./BookCardGrid";

export default function GridLayout({
  books,
  onAddToCart,
  isAuthenticated,
  onQuickView
}) {
  return (
    <div className="select-none">
      {/* Grid container */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book) => (
          <BookCardGrid
            key={book.id}
            book={book}
            onQuickView={onQuickView}
            onAddToCart={onAddToCart}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </div>
    </div>
  );
}
