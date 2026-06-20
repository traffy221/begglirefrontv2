import { useState, useMemo, useEffect } from "react";
import { Star, MessageSquare, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

const INITIAL_REVIEWS_DB = {
  1: [
    { id: 1, name: "Fatoumata Sow", rating: 5, date: "10 Mai 2026", content: "Un livre bouleversant qui résonne en chaque femme sénégalaise. L'écriture de Mariama Bâ est d'une finesse et d'une force incroyables." },
    { id: 2, name: "Ibrahima Ndiaye", rating: 4, date: "22 Avril 2026", content: "Un classique absolu. L'analyse sociale est percutante et reste d'une brûlante actualité. À lire absolument." },
    { id: 3, name: "Seynabou Diop", rating: 5, date: "15 Mars 2026", content: "La plume est sublime. La détresse et le courage de Ramatoulaye m'ont profondément touchée. C'est le chef-d'œuvre de notre littérature." }
  ],
  2: [
    { id: 1, name: "Cheikh Tidiane", rating: 5, date: "18 Mai 2026", content: "Une œuvre philosophique profonde sur le déchirement culturel. Samba Diallo incarne la complexité de notre rapport à l'Occident." },
    { id: 2, name: "Aïssatou Kane", rating: 4, date: "02 Mai 2026", content: "L'écriture est poétique et exigeante. Ce livre pose des questions fondamentales sur l'éducation et l'identité." }
  ],
  3: [
    { id: 1, name: "Amadou Diallo", rating: 5, date: "14 Juin 2026", content: "Absolument brillant ! Mbougar Sarr mérite amplement son Goncourt. Un roman-labyrinthe fascinant sur le destin de l'écrivain." },
    { id: 2, name: "Khadija Sy", rating: 5, date: "30 Mai 2026", content: "Une construction narrative époustouflante, un style riche et érudit. C'est l'un des meilleurs romans de ces dix dernières années." }
  ]
};

const GENERIC_REVIEWS = [
  { id: 101, name: "Mamadou Fall", rating: 5, date: "08 Juin 2026", content: "Une très belle découverte. L'intrigue est captivante et le style d'écriture est particulièrement agréable." },
  { id: 102, name: "Ndeye Marie", rating: 4, date: "28 Mai 2026", content: "Très satisfait de cet ouvrage. Je le recommande vivement à tous les passionnés de lecture." }
];

export default function BookReviews({ bookId, user }) {
  const initialReviews = useMemo(() => {
    return INITIAL_REVIEWS_DB[bookId] || GENERIC_REVIEWS;
  }, [bookId]);

  const [reviews, setReviews] = useState(initialReviews);
  const [showAll, setShowAll] = useState(false);

  // Form states
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState(user?.fullname || "");
  const [content, setContent] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Sync with authenticated user changes
  useEffect(() => {
    if (user?.fullname) {
      setName(user.fullname);
    }
  }, [user]);

  // Sync reviews when bookId changes
  useEffect(() => {
    setReviews(INITIAL_REVIEWS_DB[bookId] || GENERIC_REVIEWS);
    setSubmitSuccess(false);
    setContent("");
    setIsFormOpen(false);
  }, [bookId]);

  // Stats calculation
  const stats = useMemo(() => {
    if (reviews.length === 0) return { avg: 0, count: 0, distribution: [0, 0, 0, 0, 0] };
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = parseFloat((sum / reviews.length).toFixed(1));
    const dist = [0, 0, 0, 0, 0]; // 5, 4, 3, 2, 1 stars
    reviews.forEach(r => {
      const idx = 5 - r.rating;
      if (idx >= 0 && idx < 5) dist[idx]++;
    });
    const distPercent = dist.map(count => Math.round((count / reviews.length) * 100));
    return { avg, count: reviews.length, distribution: distPercent };
  }, [reviews]);

  const handleRatingClick = (val) => {
    setRating(val);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Veuillez renseigner votre nom ou pseudonyme.");
      return;
    }
    if (content.trim().length < 20) {
      setErrorMsg("Votre avis est trop court (minimum 20 caractères).");
      return;
    }

    const newReview = {
      id: Date.now(),
      name: name.trim(),
      rating,
      date: new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }),
      content: content.trim()
    };

    // Optimistic Update
    setReviews(prev => [newReview, ...prev]);
    setSubmitSuccess(true);
    setContent("");
    setRating(5);
    
    // Close success message after 5 seconds
    setTimeout(() => {
      setSubmitSuccess(false);
      setIsFormOpen(false);
    }, 4000);
  };

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  return (
    <div className="bg-white border-t border-primary-soft/10 py-16 px-6 md:px-12 max-w-5xl mx-auto font-sans select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* LEFT COLUMN: Ratings & Statistics (5/12 cols) */}
        <div className="lg:col-span-5 space-y-6 bg-ivory rounded-3xl p-6 border border-primary-soft/15 shadow-sm">
          <h3 className="font-serif font-bold text-xl text-[#1c380e]">
            Avis des lecteurs
          </h3>

          <div className="flex items-center space-x-6">
            <div className="text-5xl font-serif font-bold text-[#1c380e] leading-none">
              {stats.avg}
            </div>
            <div>
              <div className="flex space-x-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    className={`${
                      star <= Math.round(stats.avg)
                        ? "fill-accent-gold text-accent-gold"
                        : "text-[#1c380e]/10 fill-[#1c380e]/5"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray mt-1.5 font-light">
                Basé sur {stats.count} {stats.count > 1 ? "évaluations" : "évaluation"}
              </p>
            </div>
          </div>

          {/* Rating Bars Distribution */}
          <div className="space-y-2.5 pt-4 border-t border-primary-soft/10">
            {[5, 4, 3, 2, 1].map((star, idx) => (
              <div key={star} className="flex items-center text-xs space-x-3">
                <span className="w-3 text-right font-semibold text-charcoal">{star}</span>
                <Star size={12} className="fill-accent-gold text-accent-gold shrink-0" />
                <div className="flex-1 h-2 bg-[#1c380e]/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-gold rounded-full transition-all duration-[800ms]"
                    style={{ width: `${stats.distribution[idx]}%` }}
                  />
                </div>
                <span className="w-8 text-right text-gray/80 font-poppins">{stats.distribution[idx]}%</span>
              </div>
            ))}
          </div>

          {/* Trigger to write review */}
          {!isFormOpen && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="w-full text-center bg-[#1c380e] hover:bg-[#2c4e1d] text-white py-3 px-4 rounded-xl text-xs font-poppins font-bold uppercase tracking-wider shadow hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <MessageSquare size={14} />
              <span>Rédiger un avis</span>
            </button>
          )}
        </div>

        {/* RIGHT COLUMN: Reviews List & Submit Form (7/12 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Submit Form (if open) */}
          {isFormOpen && (
            <div className="bg-[#d5eac7]/10 border border-[#d5eac7]/40 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in">
              <div className="flex justify-between items-center border-b border-[#d5eac7]/20 pb-3">
                <h4 className="font-serif font-bold text-lg text-[#1c380e]">
                  Votre avis sur cet ouvrage
                </h4>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-xs font-bold text-gray hover:text-charcoal transition-colors font-poppins"
                >
                  Annuler
                </button>
              </div>

              {submitSuccess ? (
                <div className="py-6 text-center space-y-2 flex flex-col items-center">
                  <CheckCircle2 size={36} className="text-emerald-500 animate-bounce" />
                  <h5 className="font-serif font-bold text-charcoal">Avis envoyé avec succès !</h5>
                  <p className="text-xs text-gray">Merci pour votre contribution. Votre avis a été publié.</p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-500 font-semibold">
                      {errorMsg}
                    </div>
                  )}

                  {/* Star rating selector */}
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-semibold text-charcoal font-poppins">Note :</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleRatingClick(val)}
                          onMouseEnter={() => setHoverRating(val)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="focus:outline-none transition-transform hover:scale-115"
                        >
                          <Star
                            size={20}
                            className={`transition-colors duration-150 ${
                              val <= (hoverRating || rating)
                                ? "fill-accent-gold text-accent-gold"
                                : "text-gray/25 fill-transparent"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-charcoal font-poppins">Nom ou Pseudonyme</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Votre nom"
                      className="w-full bg-white border border-primary-soft/30 rounded-xl py-2.5 px-4 text-xs font-medium outline-none focus:border-[#1c380e] transition-colors shadow-sm"
                    />
                  </div>

                  {/* Review Text Area */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <label className="text-xs font-semibold text-charcoal font-poppins">Votre commentaire</label>
                      <span className={`text-[10px] font-poppins font-semibold ${content.length < 20 ? "text-rose-500" : "text-gray/60"}`}>
                        {content.length} / 500 (min 20)
                      </span>
                    </div>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value.substring(0, 500))}
                      placeholder="Qu'avez-vous pensé de l'histoire, des personnages, du style d'écriture ?"
                      rows={4}
                      className="w-full bg-white border border-primary-soft/30 rounded-xl py-2.5 px-4 text-xs leading-relaxed outline-none focus:border-[#1c380e] transition-colors shadow-sm resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-accent-gold text-charcoal font-poppins font-bold uppercase tracking-wider py-3 rounded-xl text-xs hover:bg-amber-500 hover:scale-[1.01] transition-all shadow-md active:scale-95"
                  >
                    Publier mon avis
                  </button>
                </form>
              )}
            </div>
          )}

          {/* List of Reviews */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-sm italic text-gray font-serif">
                Aucun avis n'a encore été rédigé pour ce livre. Soyez le premier à partager votre lecture !
              </p>
            ) : (
              <div className="space-y-4">
                {displayedReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="border-b border-primary-soft/10 pb-5 last:border-0 last:pb-0 animate-fade-in"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        {/* Avatar Initials Circle */}
                        <div className="w-9 h-9 rounded-full bg-[#1c380e]/5 border border-[#1c380e]/15 flex items-center justify-center font-poppins font-bold text-xs text-[#1c380e]">
                          {rev.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h5 className="font-poppins font-bold text-xs text-charcoal">{rev.name}</h5>
                          <span className="text-[9px] text-gray font-poppins font-medium">{rev.date}</span>
                        </div>
                      </div>

                      {/* Stars badge */}
                      <div className="flex space-x-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={11}
                            className={`${
                              star <= rev.rating
                                ? "fill-accent-gold text-accent-gold"
                                : "text-gray/20 fill-transparent"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-gray mt-3 leading-relaxed whitespace-pre-line font-light">
                      {rev.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Show More / Show Less Button */}
          {reviews.length > 3 && (
            <button
              onClick={() => setShowAll(prev => !prev)}
              className="text-xs font-bold font-poppins uppercase tracking-wider text-[#1c380e] hover:underline flex items-center space-x-1 mt-6"
            >
              <span>{showAll ? "Afficher moins" : `Voir tous les avis (${reviews.length})`}</span>
              {showAll ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}

        </div>
      </div>

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
