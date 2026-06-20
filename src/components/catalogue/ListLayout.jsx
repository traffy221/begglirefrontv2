import BookCardList from "./BookCardList";

export default function ListLayout({
  books,
  onAddToCart,
  isAuthenticated
}) {
  return (
    <div className="flex flex-col bg-white rounded-3xl border border-primary-soft/10 overflow-hidden shadow-sm select-none">
      {books.map((book) => (
        <BookCardList
          key={book.id}
          book={book}
          onAddToCart={onAddToCart}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  );
}
