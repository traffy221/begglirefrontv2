import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Percent, Search, Feather, Sparkles } from "lucide-react";
import apiClient from "../../api/client";

const NewsletterHome = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [msg, setMsg] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMsg("");

    try {
      const response = await apiClient.post("/newsletter/subscribe", { email });
      if (response.data && response.data.success) {
        setStatus("success");
        setMsg(response.data.message || "Inscription réussie !");
        setEmail("");
      } else {
        throw new Error(response.data?.message || "Une erreur est survenue.");
      }
    } catch (error) {
      setStatus("error");
      setMsg(error.response?.data?.message || error.message || "Erreur de connexion.");
    }
  };

  const benefits = [
    {
      icon: <Percent className="text-accent-gold" size={20} />,
      title: "Offres spéciales",
      desc: "Promotions exclusives"
    },
    {
      icon: <Search className="text-accent-gold" size={20} />,
      title: "Livres rares",
      desc: "Trouvez les pépites"
    },
    {
      icon: <Feather className="text-accent-gold" size={20} />,
      title: "Auteurs locaux",
      desc: "Plumes sénégalaises"
    },
    {
      icon: <Sparkles className="text-accent-gold" size={20} />,
      title: "Nouveautés",
      desc: "Sorties littéraires"
    }
  ];

  return (
    <section className="bg-primary py-16 px-6 md:px-12 text-white relative overflow-hidden">
      {/* Background shape */}
      <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-[#1c380e]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Heading and description */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
              Ne manquez aucune nouveauté.
            </h2>
            <p className="text-sm text-white/90 leading-relaxed font-light">
              Abonnez-vous à notre lettre d'information pour suivre l'actualité des sorties littéraires, des auteurs mis à l'honneur et bénéficier d'offres promotionnelles.
            </p>

            {/* Newsletter Input Box */}
            <div className="w-full">
              <form onSubmit={handleSubscribe} className="flex items-center space-x-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse email..."
                  required
                  disabled={status === "loading"}
                  className="bg-white text-charcoal placeholder-charcoal/40 text-xs rounded-xl px-4 py-3 outline-none border border-transparent focus:border-accent-gold focus:bg-white w-full transition-all"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="bg-accent-gold hover:bg-accent-gold/90 text-charcoal rounded-xl px-5 py-3 font-semibold text-xs transition-all flex items-center justify-center shrink-0 disabled:opacity-50 h-[42px]"
                >
                  {status === "loading" ? "..." : <Send size={14} />}
                </button>
              </form>

              {status === "success" && (
                <div className="flex items-center text-[10px] text-white bg-white/10 p-2.5 rounded-lg mt-3 space-x-2 animate-fade-in">
                  <CheckCircle2 size={12} className="shrink-0 text-white" />
                  <span>{msg}</span>
                </div>
              )}
              {status === "error" && (
                <div className="flex items-center text-[10px] text-white bg-destructive p-2.5 rounded-lg mt-3 space-x-2 animate-fade-in">
                  <AlertCircle size={12} className="shrink-0" />
                  <span>{msg}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Benefits grid */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-sm border border-white/5 rounded-2xl p-4 flex flex-col justify-between items-center text-center space-y-3"
                >
                  <div className="bg-white/10 p-2.5 rounded-xl">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-xs text-white">
                      {benefit.title}
                    </h3>
                    <p className="text-[9px] text-white/70 mt-1 font-light leading-snug">
                      {benefit.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default NewsletterHome;
