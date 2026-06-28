import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, Phone, MapPin, CheckCircle2, AlertCircle, X, Globe } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/client";

const ConnexionPage = () => {
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState("login");

  // Status & Message Feedback
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // Login Form States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register Form States (Includes all fields required by Larval backend validator)
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState("idle");
  const [forgotMsg, setForgotMsg] = useState("");

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate("/mon-compte");
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    setStatus("loading");
    setFeedbackMsg("");

    try {
      await login(loginEmail, loginPassword);
      setStatus("success");
      navigate("/mon-compte");
    } catch (error) {
      setStatus("error");
      setFeedbackMsg(
        error.response?.data?.message || 
        error.message || 
        "Une erreur est survenue lors de la connexion."
      );
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (registerPassword !== confirmPassword) {
      setStatus("error");
      setFeedbackMsg("Les mots de passe ne correspondent pas.");
      return;
    }

    setStatus("loading");
    setFeedbackMsg("");

    const payload = {
      prenom,
      nom,
      email: registerEmail,
      telephone,
      adresse,
      password: registerPassword,
      password_confirmation: confirmPassword,
    };

    try {
      const response = await register(payload);
      setStatus("success");
      setFeedbackMsg(
        response.message || 
        "Inscription réussie ! Veuillez vérifier votre email pour activer votre compte."
      );
      // Reset registration form
      setPrenom("");
      setNom("");
      setRegisterEmail("");
      setTelephone("");
      setAdresse("");
      setRegisterPassword("");
      setConfirmPassword("");
    } catch (error) {
      setStatus("error");
      setFeedbackMsg(
        error.response?.data?.message || 
        error.message || 
        "Une erreur est survenue lors de l'inscription."
      );
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;

    setForgotStatus("loading");
    setForgotMsg("");

    try {
      const response = await apiClient.post("/forgot-password", { email: forgotEmail });
      setForgotStatus("success");
      setForgotMsg(
        response.data?.message || 
        "Si un compte existe, vous recevrez un lien de réinitialisation."
      );
      setForgotEmail("");
    } catch (error) {
      setForgotStatus("error");
      setForgotMsg("Erreur lors de l'envoi du lien de réinitialisation.");
    }
  };

  // Mock Google Login (hits V2 endpoint if needed)
  const handleGoogleLogin = async () => {
    setStatus("loading");
    setFeedbackMsg("");
    try {
      // Simulate Google OAuth payload
      const mockGoogleData = {
        google_id: "google_123456789",
        email: "visitor@google.com",
        fullname: "Visiteur Google",
        picture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150"
      };

      const response = await apiClient.post("/login-with-google", mockGoogleData);
      if (response.data && response.data.success) {
        const { access_token, data: loggedUser } = response.data;
        localStorage.setItem("token", access_token);
        localStorage.setItem("user", JSON.stringify(loggedUser));
        setStatus("success");
        window.location.reload(); // Refresh to boot auth context
      } else {
        throw new Error("Paiement ou connexion Google échouée.");
      }
    } catch (error) {
      setStatus("error");
      setFeedbackMsg("Échec de l'authentification Google.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-112px)] flex items-center justify-center bg-ivory py-16 px-6 relative overflow-hidden">
      
      {/* Decorative Blur Background Graphics */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-primary-soft/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-accent-gold/5 rounded-full blur-3xl -z-10" />

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-primary-soft/20 shadow-xl p-8 space-y-8 relative z-10">
        
        {/* Title */}
        <div className="text-center space-y-1">
          <span className="text-2xl font-serif font-bold text-primary-dark">Bëgg Lire</span>
          <p className="text-xs text-gray font-light italic font-serif">
            Lire, partager, transmettre
          </p>
        </div>

        {/* Mode Toggle (Stylised Gold Tabs) */}
        <div className="grid grid-cols-2 p-1 bg-ivory rounded-xl border border-primary-soft/10">
          <button
            onClick={() => {
              setMode("login");
              setStatus("idle");
              setFeedbackMsg("");
            }}
            className={`py-2 text-xs uppercase tracking-wider font-poppins font-bold rounded-lg transition-all ${
              mode === "login"
                ? "bg-accent-gold text-charcoal shadow-sm"
                : "text-gray/70 hover:text-charcoal"
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => {
              setMode("register");
              setStatus("idle");
              setFeedbackMsg("");
            }}
            className={`py-2 text-xs uppercase tracking-wider font-poppins font-bold rounded-lg transition-all ${
              mode === "register"
                ? "bg-accent-gold text-charcoal shadow-sm"
                : "text-gray/70 hover:text-charcoal"
            }`}
          >
            Inscription
          </button>
        </div>

        {/* Global Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`flex items-start space-x-2 p-4 rounded-xl border text-sm animate-fade-in ${
              status === "success"
                ? "bg-primary-soft/20 border-primary text-primary-dark"
                : "bg-destructive/10 border-destructive text-destructive"
            }`}
          >
            {status === "success" ? (
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
            )}
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* ==========================================
           FORM: SIGN IN (CONNEXION)
           ========================================== */}
        {mode === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-gray uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-gray/40" size={16} />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="votre.email@example.com"
                  className="bg-ivory border border-primary-soft/30 rounded-xl py-3 pl-10 pr-4 text-sm text-charcoal w-full outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-gray uppercase tracking-wider">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-gray/40" size={16} />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="bg-ivory border border-primary-soft/30 rounded-xl py-3 pl-10 pr-4 text-sm text-charcoal w-full outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md mt-4"
            >
              {status === "loading" ? "Connexion..." : "Se connecter"}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsForgotModalOpen(true);
                  setForgotStatus("idle");
                  setForgotMsg("");
                }}
                className="text-xs text-primary hover:text-primary-dark font-bold hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Social Logins */}
            <div className="relative flex items-center justify-center my-6">
              <div className="border-t border-primary-soft/30 w-full" />
              <span className="absolute bg-white px-3 text-xs text-gray/40 font-poppins uppercase">
                Ou
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full border border-primary-soft/60 hover:bg-ivory text-charcoal font-semibold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center space-x-2"
            >
              <Globe size={16} className="text-primary-dark" />
              <span>Se connecter avec Google</span>
            </button>
          </form>
        )}

        {/* ==========================================
           FORM: SIGN UP (INSCRIPTION)
           ========================================== */}
        {mode === "register" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-gray uppercase tracking-wider">Prénom</label>
                <input
                  type="text"
                  required
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Fatou"
                  className="bg-ivory border border-primary-soft/30 rounded-xl p-3 text-sm text-charcoal outline-none focus:border-primary transition-all"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-gray uppercase tracking-wider">Nom</label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Diop"
                  className="bg-ivory border border-primary-soft/30 rounded-xl p-3 text-sm text-charcoal outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-gray uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-gray/40" size={16} />
                <input
                  type="email"
                  required
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="fatou.diop@example.com"
                  className="bg-ivory border border-primary-soft/30 rounded-xl py-3 pl-10 pr-4 text-sm text-charcoal w-full outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-gray uppercase tracking-wider">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 text-gray/40" size={16} />
                <input
                  type="tel"
                  required
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="771234567"
                  className="bg-ivory border border-primary-soft/30 rounded-xl py-3 pl-10 pr-4 text-sm text-charcoal w-full outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-gray uppercase tracking-wider">Commune / Adresse</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 text-gray/40" size={16} />
                <input
                  type="text"
                  required
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder="Ex: Medina, Dakar"
                  className="bg-ivory border border-primary-soft/30 rounded-xl py-3 pl-10 pr-4 text-sm text-charcoal w-full outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-gray uppercase tracking-wider">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-gray/40" size={16} />
                <input
                  type="password"
                  required
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="6 caractères minimum"
                  className="bg-ivory border border-primary-soft/30 rounded-xl py-3 pl-10 pr-4 text-sm text-charcoal w-full outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-gray uppercase tracking-wider">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-gray/40" size={16} />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ressaisir le mot de passe"
                  className="bg-ivory border border-primary-soft/30 rounded-xl py-3 pl-10 pr-4 text-sm text-charcoal w-full outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md mt-4"
            >
              {status === "loading" ? "Création en cours..." : "Créer mon compte"}
            </button>
          </form>
        )}

      </div>

      {/* ==========================================
         FORGOT PASSWORD INLINE MODAL
         ========================================== */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl border border-primary-soft/20 shadow-2xl p-6 relative">
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-gray hover:text-charcoal transition-colors rounded-full"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <h3 className="font-serif font-bold text-lg text-charcoal border-b border-primary-soft/10 pb-3 mb-4">
              Mot de passe oublié
            </h3>

            {forgotMsg && (
              <div
                className={`flex items-start space-x-2 p-3 rounded-lg border text-xs mb-4 ${
                  forgotStatus === "success"
                    ? "bg-primary-soft/20 border-primary text-primary-dark"
                    : "bg-destructive/10 border-destructive text-destructive"
                }`}
              >
                <span>{forgotMsg}</span>
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-gray uppercase tracking-wider">
                  Adresse email du compte
                </label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="votre.email@example.com"
                  className="bg-ivory border border-primary-soft/30 rounded-xl p-3 text-sm text-charcoal outline-none focus:border-primary w-full transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={forgotStatus === "loading"}
                className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs transition-all"
              >
                {forgotStatus === "loading" ? "Envoi..." : "Envoyer le lien de réinitialisation"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ConnexionPage;
