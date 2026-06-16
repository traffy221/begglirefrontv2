const PartenairesFooter = () => {
  const partners = [
    "L'Harmattan Sénégal",
    "Présence Africaine",
    "NEAS (Nouvelles Éditions Africaines du Sénégal)",
    "Éditions Vents d'Ailleurs",
    "Mémoire d'Encrier",
    "Alliance Éditeurs Indépendants"
  ];

  return (
    <section className="py-12 px-6 bg-ivory border-t border-primary-soft/10">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col items-center space-y-6">
          <span className="text-[9px] font-poppins uppercase tracking-widest text-gray/60 font-bold select-none text-center">
            Partenaires Éditoriaux & Institutionnels
          </span>
          
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 md:gap-x-12">
            {partners.map((partner, idx) => (
              <span
                key={idx}
                className="font-serif font-semibold text-charcoal/40 text-xs md:text-sm tracking-tight hover:text-charcoal/70 transition-colors cursor-default select-none whitespace-nowrap"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartenairesFooter;
