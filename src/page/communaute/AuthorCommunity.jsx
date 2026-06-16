import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, PenTool, Calendar } from "lucide-react";
import apiClient, { IMAGE_URL } from "../../api/client";

const AuthorCommunity = () => {
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authorName, setAuthorName] = useState("");
  const [contents, setContents] = useState([]);

  useEffect(() => {
    const fetchAuthorWorks = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/author-articles/${id}`);
        // Handle pagination data format
        const itemsList = response.data?.data || response.data?.current_page ? (response.data.data || []) : response.data || [];
        setContents(itemsList);

        // Extract author name from the first item if available
        if (itemsList.length > 0) {
          setAuthorName(itemsList[0].fullname || "Auteur de la communauté");
        } else {
          setAuthorName("Membre de la communauté");
        }
      } catch (err) {
        setError("Erreur lors de la récupération des publications de l'auteur.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAuthorWorks();
    }
  }, [id]);

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400";
    if (path.startsWith("http")) return path;
    return `${IMAGE_URL}/${path}`;
  };

  const getFormattedDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-dark" />
        <p className="font-serif italic text-gray">Chargement du profil auteur...</p>
      </div>
    );
  }

  if (error || contents.length === 0) {
    return (
      <div className="container mx-auto px-6 py-20 text-center space-y-4 max-w-md">
        <h2 className="font-serif text-2xl font-bold text-charcoal">Auteur Introuvable</h2>
        <p className="text-gray">{error || "Cet auteur n'a pas encore publié d'articles ou de chroniques."}</p>
        <Link
          to="/communaute"
          className="inline-flex items-center space-x-2 bg-primary text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-primary-dark transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Retour à la communauté</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 md:px-12 max-w-5xl py-12 space-y-12">
      {/* Back button */}
      <div>
        <Link
          to="/communaute"
          className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-wider font-poppins font-bold text-primary hover:text-primary-dark"
        >
          <ArrowLeft size={14} />
          <span>Retour à la communauté</span>
        </Link>
      </div>

      {/* Author Profile Card */}
      <section className="bg-white rounded-3xl p-8 border border-primary-soft/20 shadow-sm flex items-center space-x-6">
        <div className="w-16 h-16 bg-primary-soft/40 text-primary-dark font-serif font-bold text-2xl rounded-full flex items-center justify-center border-2 border-primary shadow-sm">
          {authorName[0]?.toUpperCase()}
        </div>
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-poppins text-primary font-bold tracking-wider">
            Plume de Bëgg Lire
          </span>
          <h1 className="font-serif font-bold text-2xl md:text-3xl text-charcoal leading-tight">
            {authorName}
          </h1>
          <p className="text-xs text-gray">
            Auteur de {contents.length} publications (chroniques et critiques littéraires)
          </p>
        </div>
      </section>

      {/* Author Publications Grid */}
      <section className="space-y-8">
        <h2 className="font-serif font-bold text-xl text-charcoal border-b border-primary-soft/10 pb-3">
          Publications de {authorName}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {contents.map((item, idx) => {
            const isChronique = item.type === "chronique";
            const detailUrl = isChronique
              ? `/communaute/chronique/${item.reference || item.id}`
              : `/communaute/article/${item.type || "blog"}/${item.id}`;

            return (
              <div
                key={idx}
                className="bg-white rounded-3xl overflow-hidden border border-primary-soft/10 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between h-full"
              >
                <div className="space-y-4">
                  <Link to={detailUrl} className="h-48 overflow-hidden block bg-ivory">
                    <img
                      src={getImgUrl(item.image_link || item.cover_image || item.image)}
                      alt={item.titre}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                  </Link>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-[10px] uppercase font-poppins font-bold tracking-wider">
                      <span className={isChronique ? "text-accent-gold" : "text-primary-dark"}>
                        {isChronique ? "Chronique" : "Article"}
                      </span>
                      {item.created_at && (
                        <span className="flex items-center text-gray/50 font-normal">
                          <Calendar size={10} className="mr-1" />
                          {getFormattedDate(item.created_at)}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif font-bold text-lg text-charcoal line-clamp-1 group-hover:text-primary transition-colors">
                      <Link to={detailUrl}>{item.titre}</Link>
                    </h3>

                    <p className="text-gray text-xs sm:text-sm leading-relaxed line-clamp-2">
                      {item.resume || item.contenu?.replace(/<[^>]*>/g, "") || ""}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2">
                  <Link
                    to={detailUrl}
                    className="inline-flex items-center space-x-1.5 text-xs text-primary font-bold hover:underline"
                  >
                    <span>{isChronique ? "Lire le récit" : "Lire l'article"}</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default AuthorCommunity;
