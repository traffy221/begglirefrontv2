import Hero from "../components/home/Hero";
import AuteurSemaine from "../components/home/AuteurSemaine";
import LivresTendances from "../components/home/LivresTendances";
import LivreDuMoment from "../components/home/LivreDuMoment";
import BannierePromo from "../components/home/BannierePromo";
import AParaitre from "../components/home/AParaitre";
import Nouveautes from "../components/home/Nouveautes";
import ChoixEquipe from "../components/home/ChoixEquipe";
import LivresALaUne from "../components/home/LivresALaUne";
import FournituresScolairesHome from "../components/home/FournituresScolairesHome";
import RubriquesEditoriales from "../components/home/RubriquesEditoriales";
import DerniersArticles from "../components/home/DerniersArticles";
import AuteurSemaineSecond from "../components/home/AuteurSemaineSecond";
import NewsletterHome from "../components/home/NewsletterHome";
import PartenairesFooter from "../components/home/PartenairesFooter";

const Home = () => {
  return (
    <div className="flex flex-col bg-ivory">
      {/* 1. HERO SECTION */}
      <Hero />

      {/* 2. AUTEUR DE LA SEMAINE */}
      <AuteurSemaine />

      {/* 3. LIVRES TENDANCES */}
      <LivresTendances />

      {/* 4. LIVRE DU MOMENT */}
      <LivreDuMoment />

      {/* 5. BANNIÈRE PROMO */}
      <BannierePromo />

      {/* 6. À PARAÎTRE */}
      <AParaitre />

      {/* 7. NOUVEAUTÉS */}
      <Nouveautes />

      {/* 8. CHOIX DE L'ÉQUIPE */}
      <ChoixEquipe />

      {/* 9. LIVRES À LA UNE */}
      <LivresALaUne />

      {/* 10. FOURNITURES SCOLAIRES */}
      <FournituresScolairesHome />

      {/* 11. RUBRIQUES ÉDITORIALES */}
      <RubriquesEditoriales />

      {/* 12. DERNIERS ARTICLES */}
      <DerniersArticles />

      {/* 13. AUTEUR DE LA SEMAINE SECOND */}
      <AuteurSemaineSecond />

      {/* 14. NEWSLETTER */}
      <NewsletterHome />

      {/* 15. PARTENAIRES */}
      <PartenairesFooter />
    </div>
  );
};

export default Home;
