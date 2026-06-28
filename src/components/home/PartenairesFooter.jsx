import { useState } from "react";

// Imports des logos des partenaires institutionnels depuis les assets copiés
import cenacle from "../../assets/partenaires/Cenacle-jeunes-auteurs-senegal.webp";
import festic from "../../assets/partenaires/festic-association-femmes-senegalaises-TIC.webp";
import jeader from "../../assets/partenaires/Jeader-jeunes-entrepreneurs-africains-developpement-partenaires.webp";
import orange from "../../assets/partenaires/orange-sonatel-prix-entrepreneur-social.webp";
import shine from "../../assets/partenaires/Shine-to-lead-jiggen-jang-tekki-partenaire.webp";
import dakar from "../../assets/partenaires/Ville-Dakar-partenaire.webp";

const PartenairesFooter = () => {
  // Liste des partenaires institutionnels
  const partnersData = [
    {
      name: "JEADER (Jeunes Entrepreneurs Africains pour le Développement)",
      logo: jeader,
      website: "https://jeader.org"
    },
    {
      name: "Orange Sonatel (Prix Orange de l'Entrepreneur Social)",
      logo: orange,
      website: "https://www.orange.sn"
    },
    {
      name: "Shine To Lead – Jiggen Jang Tekki",
      logo: shine,
      website: "https://www.shinetolead.org"
    },
    {
      name: "Ville de Dakar",
      logo: dakar,
      website: "https://www.villededakar.sn"
    },
    {
      name: "Cénacle des Jeunes Auteurs du Sénégal",
      logo: cenacle,
      website: "#"
    },
    {
      name: "FESTIC (Femmes Sénégalaises en TIC)",
      logo: festic,
      website: "#"
    }
  ];

  // Gestion du fallback en cas de logo manquant/cassé
  const [logoErrors, setLogoErrors] = useState({});

  const handleLogoError = (name) => {
    setLogoErrors((prev) => ({ ...prev, [name]: true }));
  };

  return (
    <section className="py-12 px-6 bg-ivory border-t border-primary-soft/10">
      {/* Styles injectés pour l'animation du marquee infini */}
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-50% - 12px));
          }
        }
        .animate-marquee-infinite {
          animation: marquee 35s linear infinite;
        }
        .animate-marquee-infinite:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col items-center space-y-8">
          {/* Titre de la section */}
          <span className="text-xs md:text-sm font-poppins uppercase tracking-widest text-gray/60 font-bold select-none text-center">
            Partenaires Institutionnels
          </span>
          
          {/* Conteneur principal du marquee avec dégradés de fondu latéraux */}
          <div className="relative w-full overflow-hidden py-4">
            {/* Effet Fade In/Out sur les côtés gauche et droit */}
            <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-ivory via-ivory/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-ivory via-ivory/80 to-transparent z-10 pointer-events-none" />

            {/* Bande de défilement infini */}
            <div className="flex w-max gap-6 animate-marquee-infinite">
              {/* Groupe 1 */}
              <div className="flex gap-6 shrink-0">
                {partnersData.map((partner, idx) => (
                  <div
                    key={`g1-${idx}`}
                    className="bg-white border border-[#181818]/5 rounded-2xl p-4 flex flex-col items-center justify-between text-center shadow-sm hover:shadow-md hover:scale-105 opacity-65 hover:opacity-100 transition-all duration-300 w-44 h-32 md:w-56 md:h-44 shrink-0 select-none"
                  >
                    {/* Conteneur logo - augmenté en hauteur */}
                    <div className="w-full h-16 md:h-24 flex items-center justify-center bg-[#f9f9f9] rounded-xl p-3 md:p-4 overflow-hidden mb-2">
                      {!logoErrors[partner.name] && partner.logo ? (
                        <img
                          src={partner.logo}
                          alt={partner.name}
                          onError={() => handleLogoError(partner.name)}
                          className="max-h-full max-w-full object-contain"
                          loading="lazy"
                          draggable="false"
                        />
                      ) : (
                        <span className="text-xs md:text-sm font-serif font-bold text-accent-gold uppercase tracking-wider text-center px-1">
                          {partner.name.split("–")[0].split("(")[0].trim()}
                        </span>
                      )}
                    </div>
                    
                    {/* Nom du partenaire - augmenté en taille de police */}
                    <span className="text-[10px] md:text-xs font-semibold text-charcoal/70 tracking-tight leading-tight line-clamp-2 w-full mt-1">
                      {partner.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Groupe 2 (Duplication pour assurer la boucle infinie fluide) */}
              <div className="flex gap-6 shrink-0" aria-hidden="true">
                {partnersData.map((partner, idx) => (
                  <div
                    key={`g2-${idx}`}
                    className="bg-white border border-[#181818]/5 rounded-2xl p-4 flex flex-col items-center justify-between text-center shadow-sm hover:shadow-md hover:scale-105 opacity-65 hover:opacity-100 transition-all duration-300 w-44 h-32 md:w-56 md:h-44 shrink-0 select-none"
                  >
                    {/* Conteneur logo - augmenté en hauteur */}
                    <div className="w-full h-16 md:h-24 flex items-center justify-center bg-[#f9f9f9] rounded-xl p-3 md:p-4 overflow-hidden mb-2">
                      {!logoErrors[partner.name] && partner.logo ? (
                        <img
                          src={partner.logo}
                          alt={partner.name}
                          onError={() => handleLogoError(partner.name)}
                          className="max-h-full max-w-full object-contain"
                          loading="lazy"
                          draggable="false"
                        />
                      ) : (
                        <span className="text-xs md:text-sm font-serif font-bold text-accent-gold uppercase tracking-wider text-center px-1">
                          {partner.name.split("–")[0].split("(")[0].trim()}
                        </span>
                      )}
                    </div>
                    
                    {/* Nom du partenaire - augmenté en taille de police */}
                    <span className="text-[10px] md:text-xs font-semibold text-charcoal/70 tracking-tight leading-tight line-clamp-2 w-full mt-1">
                      {partner.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartenairesFooter;
