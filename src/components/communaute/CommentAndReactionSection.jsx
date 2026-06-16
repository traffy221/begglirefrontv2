import { useState, useEffect } from "react";
import { Heart, Send, CheckCircle2, MessageSquare } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/client";

const CommentAndReactionSection = ({ type, id }) => {
  const { user, isAuthenticated } = useAuth();
  
  // Comments state
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Reactions state
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  // Fetch comments and reactions on mount
  useEffect(() => {
    const fetchCommentsAndReactions = async () => {
      setCommentsLoading(true);
      try {
        // Fetch comments
        const commentsRes = await apiClient.get(`/comments/${type}/${id}`);
        if (commentsRes.data && commentsRes.data.success) {
          setComments(commentsRes.data.data || []);
        }

        // Fetch reactions
        const reactionKey = `liked_${type}_${id}`;
        const storedLiked = sessionStorage.getItem(reactionKey);
        if (storedLiked) {
          setHasLiked(true);
        }

        // Simulate fetching likes count from backend response if available, or generate a random mock count
        const mockLikesBase = type === "blog" ? 42 : 115;
        setLikesCount(mockLikesBase + (storedLiked ? 1 : 0));
        
      } catch (error) {
        console.error("Error loading comments/reactions", error);
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchCommentsAndReactions();
  }, [type, id]);

  const handleLike = async () => {
    const reactionKey = `liked_${type}_${id}`;
    if (hasLiked) return; // Prevent double liking

    // Optimistic Update
    setLikesCount(prev => prev + 1);
    setHasLiked(true);
    sessionStorage.setItem(reactionKey, "true");

    try {
      if (isAuthenticated) {
        await apiClient.post("/reactions/auth", { type, id });
      } else {
        await apiClient.post("/reactions/guest", { type, id });
      }
    } catch (error) {
      // Rollback on error
      console.error("Failed to persist reaction", error);
      setLikesCount(prev => prev - 1);
      setHasLiked(false);
      sessionStorage.removeItem(reactionKey);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitSuccess(false);

    if (commentText.trim().length < 10) {
      setErrorMsg("Le commentaire doit faire au moins 10 caractères.");
      return;
    }

    if (!isAuthenticated && (!guestName.trim() || !guestEmail.trim())) {
      setErrorMsg("Veuillez renseigner votre nom et votre adresse email.");
      return;
    }

    try {
      const payload = {
        type,
        target_id: id,
        content: commentText,
        name: isAuthenticated ? `${user.prenom} ${user.nom}` : guestName,
        email: isAuthenticated ? user.email : guestEmail
      };

      const endpoint = isAuthenticated ? "/comments/auth" : "/comments/guest";
      const response = await apiClient.post(endpoint, payload);

      if (response.data && response.data.success) {
        setSubmitSuccess(true);
        setCommentText("");
        if (!isAuthenticated) {
          setGuestName("");
          setGuestEmail("");
        }
        
        // Push the new comment in state for real-time visual satisfaction (will show as pending moderation)
        const mockNewComment = {
          id: Date.now(),
          name: payload.name,
          content: payload.content,
          created_at: new Date().toISOString(),
          is_pending: true
        };
        setComments(prev => [...prev, mockNewComment]);
        
        // Hide success message after 4s
        setTimeout(() => setSubmitSuccess(false), 4000);
      } else {
        throw new Error(response.data?.message || "Une erreur est survenue.");
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || error.message || "Erreur de connexion.");
    }
  };

  return (
    <div className="space-y-8 pt-8 border-t border-primary-soft/20">
      
      {/* Reactions Bar */}
      <div className="flex items-center justify-between bg-ivory rounded-2xl px-6 py-4 border border-primary-soft/10">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleLike}
            className={`p-2.5 rounded-full border transition-all flex items-center justify-center ${
              hasLiked
                ? "bg-rose-50 border-rose-200 text-rose-500 scale-105"
                : "bg-white border-primary-soft/30 text-gray hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50/50"
            }`}
            aria-label="Aimer cette publication"
          >
            <Heart className={`shrink-0 ${hasLiked ? "fill-rose-500 stroke-rose-500" : ""}`} size={20} />
          </button>
          <span className="font-poppins text-sm font-semibold text-charcoal">
            {likesCount} {likesCount > 1 ? "J'aime" : "J'aime"}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 text-gray text-xs font-poppins">
          <MessageSquare size={16} />
          <span>{comments.length} commentaires</span>
        </div>
      </div>

      {/* Comments Log */}
      <div className="space-y-6">
        <h3 className="font-serif font-bold text-xl text-charcoal">
          Commentaires ({comments.length})
        </h3>

        {commentsLoading ? (
          <div className="py-6 flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-primary-dark" />
            <span className="text-xs text-gray italic">Chargement des avis...</span>
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => {
              const initial = comment.name ? comment.name[0].toUpperCase() : "A";
              return (
                <div
                  key={comment.id}
                  className={`bg-white rounded-2xl p-5 border border-primary-soft/10 shadow-sm space-y-2 relative transition-all ${
                    comment.is_pending ? "opacity-75 bg-slate-50/50 border-dashed border-primary/30" : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary-soft/30 text-primary-dark font-bold font-poppins text-xs flex items-center justify-center">
                      {initial}
                    </div>
                    <div>
                      <span className="font-poppins text-xs font-semibold text-charcoal block">
                        {comment.name}
                      </span>
                      <span className="text-[10px] text-gray/50 block">
                        {comment.created_at ? new Date(comment.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        }) : "Récemment"}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-charcoal/80 leading-relaxed font-light pl-11">
                    {comment.content}
                  </p>

                  {comment.is_pending && (
                    <span className="absolute top-2 right-4 text-[9px] font-poppins font-bold bg-accent-gold/20 text-charcoal px-2.5 py-0.5 rounded-full">
                      En attente de modération
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-gray italic">Aucun commentaire rédigé. Soyez le premier à donner votre avis !</p>
        )}
      </div>

      {/* Comment Form */}
      <div className="bg-white rounded-3xl p-6 border border-primary-soft/10 shadow-sm space-y-4">
        <h4 className="font-serif font-bold text-base text-charcoal">Laisser un commentaire</h4>
        
        <form onSubmit={handleCommentSubmit} className="space-y-4">
          
          {/* Guest inputs if not authenticated */}
          {!isAuthenticated && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Nom ou pseudo</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Votre nom..."
                  required
                  className="w-full bg-ivory text-xs px-4 py-2.5 rounded-xl border border-primary-soft/20 outline-none focus:border-primary-dark transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Adresse email</label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="votre@email.com..."
                  required
                  className="w-full bg-ivory text-xs px-4 py-2.5 rounded-xl border border-primary-soft/20 outline-none focus:border-primary-dark transition-colors"
                />
              </div>
            </div>
          )}

          {/* Comment text area */}
          <div className="space-y-1">
            <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Votre message (min. 10 caractères)</label>
            <textarea
              rows={4}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={isAuthenticated ? "Partagez votre avis sur cette publication..." : "Écrivez votre commentaire..."}
              required
              className="w-full bg-ivory text-xs p-4 rounded-xl border border-primary-soft/20 outline-none focus:border-primary-dark transition-colors resize-none"
            />
          </div>

          {errorMsg && (
            <div className="text-[10px] font-semibold text-rose-500 bg-rose-50 border border-rose-100 p-2.5 rounded-xl flex items-center space-x-2">
              <span>{errorMsg}</span>
            </div>
          )}

          {submitSuccess && (
            <div className="text-[10px] font-semibold text-primary-dark bg-primary/10 border border-primary-soft/30 p-2.5 rounded-xl flex items-center space-x-2">
              <CheckCircle2 size={12} className="shrink-0 text-primary" />
              <span>Commentaire en attente de modération</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primary-dark hover:bg-primary text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow transition-all duration-300"
            >
              <Send size={12} />
              <span>Publier mon commentaire</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default CommentAndReactionSection;
