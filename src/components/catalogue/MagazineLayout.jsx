import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import BookCardMagazine from "./BookCardMagazine";

export default function MagazineLayout({
  books,
  onQuickView,
  onAddToCart
}) {
  
  // Chunk books by 8 to implement the alternating layout rhythm (3 for BLOC A, 4 for BLOC B, 1 for BLOC C)
  const chunks = [];
  for (let i = 0; i < books.length; i += 8) {
    chunks.push(books.slice(i, i + 8));
  }

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600";
    if (path.startsWith("http")) return path;
    return `http://localhost:8000/storage/${path}`;
  };

  return (
    <div className="space-y-12 select-none">
      {chunks.map((chunk, chunkIdx) => {
        // chunk[0..2] -> BLOC A (Featured + 2 Compacts)
        // chunk[3..6] -> BLOC B (4 equal columns on desktop)
        // chunk[7]    -> BLOC C (1 full horizontal card)
        
        const hasA = chunk.length > 0;
        const hasB = chunk.length > 3;
        const hasC = chunk.length > 7;

        return (
          <div key={chunkIdx} className="space-y-12">
            
            {/* BLOC A: 1 Featured (60% width) + 2 Compacts (40% width) */}
            {hasA && (
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-stretch">
                
                {/* 1. Featured card (60% width) */}
                <div className="lg:col-span-6">
                  <BookCardMagazine
                    book={chunk[0]}
                    layout="featured"
                    onQuickView={onQuickView}
                    onAddToCart={onAddToCart}
                  />
                </div>

                {/* 2. Two compact cards side by side (40% width) */}
                {chunk.length > 1 && (
                  <div className="lg:col-span-4 grid grid-cols-2 gap-4">
                    <BookCardMagazine
                      book={chunk[1]}
                      layout="compact"
                      onQuickView={onQuickView}
                      onAddToCart={onAddToCart}
                    />
                    {chunk.length > 2 && (
                      <BookCardMagazine
                        book={chunk[2]}
                        layout="compact"
                        onQuickView={onQuickView}
                        onAddToCart={onAddToCart}
                      />
                    )}
                  </div>
                )}

              </div>
            )}

            {/* BLOC B: 4 Columns Grid on Desktop (lg:grid-cols-4), 3 on Tablet (md:grid-cols-3) */}
            {hasB && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {chunk.slice(3, 7).map((b) => (
                  <BookCardMagazine
                    key={b.id}
                    book={b}
                    layout="compact"
                    onQuickView={onQuickView}
                    onAddToCart={onAddToCart}
                  />
                ))}
              </div>
            )}

            {/* BLOC C: 1 Large Horizontal card (alternating white/sage-soft background) */}
            {hasC && (() => {
              const bC = chunk[7];
              const coverUrl = getImgUrl(bC.image || bC.cover || bC.image_link);
              const price = Number(bC.prix_vente !== undefined ? bC.prix_vente : (bC.prix !== undefined ? bC.prix : 0));
              const categoryName = bC.category?.name || bC.categorie || "Roman";
              const author = bC.auteur || "Auteur inconnu";
              const desc = bC.description || "Aucun résumé disponible pour cet ouvrage d'exception.";
              const shortDesc = desc.length > 150 ? `${desc.substring(0, 150)}...` : desc;
              const bgColor = chunkIdx % 2 === 0 ? "bg-white" : "bg-[#1c380e]/5";

              return (
                <div className={`flex flex-col md:flex-row border border-primary-soft/10 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group ${bgColor}`}>
                  
                  {/* Square cover left (40%) */}
                  <Link
                    to={`/catalogue/${bC.id}`}
                    className="w-full md:w-2/5 aspect-square relative overflow-hidden flex items-center justify-center bg-[#1c380e]/5 border-r border-primary-soft/5 shrink-0"
                  >
                    <img
                      src={coverUrl}
                      alt={bC.titre}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-[600ms]"
                    />
                    <div className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur rounded-full text-charcoal shadow opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye size={16} />
                    </div>
                  </Link>

                  {/* Info right (60%) */}
                  <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <span className="inline-block text-[9px] font-poppins font-bold uppercase tracking-widest bg-[#1c380e]/10 text-[#1c380e] px-2.5 py-1 rounded">
                        {categoryName}
                      </span>
                      <h3 className="font-serif font-bold text-2xl text-charcoal leading-tight group-hover:text-[#1c380e] transition-colors">
                        <Link to={`/catalogue/${bC.id}`}>{bC.titre}</Link>
                      </h3>
                      <p className="text-sm font-poppins font-semibold text-gray">Par {author}</p>
                      <p className="text-xs text-gray/80 leading-relaxed font-light">
                        {shortDesc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-primary-soft/10 select-none">
                      <span className="text-xl font-poppins font-bold text-charcoal">
                        {price.toLocaleString()} FCFA
                      </span>
                      <Link
                        to={`/catalogue/${bC.id}`}
                        className="bg-[#1c380e] hover:bg-[#2c4e1d] text-white text-xs font-poppins font-bold uppercase tracking-wider py-2.5 px-6 rounded-xl transition-all active:scale-95"
                      >
                        Voir
                      </Link>
                    </div>
                  </div>

                </div>
              );
            })()}

          </div>
        );
      })}
    </div>
  );
}
