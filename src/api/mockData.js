// Senegal-centric Mock Database for Bëgg Lire Frontend V3

// ==========================================
// 1. DATA COLLECTIONS (Initial State)
// ==========================================

export const mockCategories = [
  { id: 1, name: "Littérature Africaine", slug: "litterature-africaine" },
  { id: 2, name: "Poésie & Essais", slug: "poesie-essais" },
  { id: 3, name: "Bande Dessinée & Mangas", slug: "bd-mangas" },
  { id: 4, name: "Romans & Thrillers", slug: "romans-thrillers" },
  { id: 5, name: "Manuels Scolaires", slug: "manuels-scolaires" }
];

export const mockSupplyCategories = [
  { id: "papeterie", name: "Cahiers & Papeterie", slug: "cahiers-papeterie" },
  { id: "ecriture", name: "Stylos & Écriture", slug: "stylos-ecriture" },
  { id: "bagagerie", name: "Sacs & Bagagerie", slug: "sacs-bagagerie" },
  { id: "dessin", name: "Dessin & Activités", slug: "dessin-activites" }
];

// Initial mock books
export let mockBooks = [
  {
    id: 1,
    titre: "Une si longue lettre",
    auteur: "Mariama Bâ",
    prix_vente: 4500,
    prix: 4500,
    category_id: 1,
    category: { id: 1, name: "Littérature Africaine" },
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600",
    image_link: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600",
    description: "Ce roman épistolaire majeur est un chef-d'œuvre de la littérature africaine. À travers la longue lettre de Ramatoulaye à sa meilleure amie Aïssatou, Mariama Bâ brosse un portrait poignant de la condition féminine au Sénégal post-indépendance, abordant le veuvage, la polygamie, et l'émancipation intellectuelle.",
    etat_livre: "Neuf",
    etat: "Neuf",
    stock: 12,
    quantite: 12,
    views_count: 342,
    nb_vues: 342,
    isbn: "9782708703797",
    is_featured: true,
    category_slug: "litterature-africaine"
  },
  {
    id: 2,
    titre: "L'Aventure ambiguë",
    auteur: "Cheikh Hamidou Kane",
    prix_vente: 5000,
    prix: 5000,
    category_id: 1,
    category: { id: 1, name: "Littérature Africaine" },
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600",
    image_link: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600",
    description: "Samba Diallo est tiraillé entre l'école coranique traditionnelle du pays des Diallobé et la culture rationnelle occidentale en France. Un classique universel sur le choc des civilisations, la perte de repères spirituels et le drame de l'assimilation culturelle.",
    etat_livre: "Occasion",
    etat: "Occasion",
    stock: 5,
    quantite: 5,
    views_count: 289,
    nb_vues: 289,
    isbn: "9782266028165",
    is_featured: true,
    category_slug: "litterature-africaine"
  },
  {
    id: 3,
    titre: "La plus secrète mémoire des hommes",
    auteur: "Mohamed Mbougar Sarr",
    prix_vente: 9500,
    prix: 9500,
    category_id: 1,
    category: { id: 1, name: "Littérature Africaine" },
    image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600",
    image_link: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600",
    description: "Prix Goncourt 2021. Un roman labyrinthique éblouissant de jeunesse et d'érudition. Un jeune écrivain sénégalais à Paris part sur les traces d'un auteur mystérieux surnommé le 'Rimbaud nègre' après la découverte d'un livre culte paru en 1938.",
    etat_livre: "Neuf",
    etat: "Neuf",
    stock: 8,
    quantite: 8,
    views_count: 512,
    nb_vues: 512,
    isbn: "9782370552891",
    is_featured: false,
    category_slug: "litterature-africaine"
  },
  {
    id: 4,
    titre: "Hosties noires",
    auteur: "Léopold Sédar Senghor",
    prix_vente: 3800,
    prix: 3800,
    category_id: 2,
    category: { id: 2, name: "Poésie & Essais" },
    image: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=600",
    image_link: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=600",
    description: "Dans ce recueil poétique publié en 1948, le poète-président sénégalais célèbre le sacrifice des tirailleurs sénégalais durant la Seconde Guerre mondiale tout en approfondissant le concept culturel et philosophique de la négritude.",
    etat_livre: "Occasion",
    etat: "Occasion",
    stock: 3,
    quantite: 3,
    views_count: 145,
    nb_vues: 145,
    isbn: "9782020028219",
    is_featured: false,
    category_slug: "poesie-essais"
  },
  {
    id: 5,
    titre: "Le Devoir de violence",
    auteur: "Yambo Ouologuem",
    prix_vente: 4800,
    prix: 4800,
    category_id: 1,
    category: { id: 1, name: "Littérature Africaine" },
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=600",
    image_link: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=600",
    description: "Fresque épique sans concession de l'empire fictif du Nakem, ce livre dénonce à la fois la violence précoloniale féodale, le colonialisme et l'aliénation intellectuelle. Un roman polémique, puissant et inclassable.",
    etat_livre: "Occasion",
    etat: "Occasion",
    stock: 6,
    quantite: 6,
    views_count: 98,
    nb_vues: 98,
    isbn: "9782020063234",
    is_featured: false,
    category_slug: "litterature-africaine"
  },
  {
    id: 6,
    titre: "Les Frasques d'Ebinto",
    auteur: "Amadou Koné",
    prix_vente: 3500,
    prix: 3500,
    category_id: 4,
    category: { id: 4, name: "Romans & Thrillers" },
    image: "https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?q=80&w=600",
    image_link: "https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?q=80&w=600",
    description: "L'histoire dramatique d'Ebinto, un jeune lycéen ivoirien ambitieux dont la vie bascule après une liaison amoureuse involontaire qui l'oblige à renoncer à ses études. Un classique sur les erreurs de jeunesse et la fatalité sociale.",
    etat_livre: "Neuf",
    etat: "Neuf",
    stock: 15,
    quantite: 15,
    views_count: 422,
    nb_vues: 422,
    isbn: "9782708200609",
    is_featured: true,
    category_slug: "romans-thrillers"
  },
  {
    id: 7,
    titre: "Alal, le trésor caché",
    auteur: "Saliou Diop",
    prix_vente: 6500,
    prix: 6500,
    category_id: 3,
    category: { id: 3, name: "Bande Dessinée & Mangas" },
    image: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=600",
    image_link: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=600",
    description: "Une BD sénégalaise moderne colorée et rythmée. Suivez les aventures d'un jeune pêcheur de Guet Ndar à Saint-Louis à la recherche d'un parchemin historique légendaire à travers le fleuve Sénégal.",
    etat_livre: "Neuf",
    etat: "Neuf",
    stock: 10,
    quantite: 10,
    views_count: 184,
    nb_vues: 184,
    isbn: "9782914605934",
    is_featured: false,
    category_slug: "bd-mangas"
  },
  {
    id: 8,
    titre: "Physique-Chimie Terminale S",
    auteur: "Collectif d'enseignants",
    prix_vente: 7500,
    prix: 7500,
    category_id: 5,
    category: { id: 5, name: "Manuels Scolaires" },
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600",
    image_link: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600",
    description: "Le manuel de référence conforme au programme officiel des lycées du Sénégal. Contient des cours structurés, des exercices résolus et des préparations aux épreuves du baccalauréat.",
    etat_livre: "Neuf",
    etat: "Neuf",
    stock: 25,
    quantite: 25,
    views_count: 650,
    nb_vues: 650,
    isbn: "9782913988775",
    is_featured: false,
    category_slug: "manuels-scolaires"
  }
];

// Initial mock school supplies
export const mockSupplies = [
  {
    id: 101,
    title: "Cahier d'Exercices Seyes 200 pages",
    supplier_name: "Cahier Seyes 200 pages",
    prix_vente: 900,
    prix: 900,
    category_id: "papeterie",
    category: "papeterie",
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=600",
    image_url: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=600",
    description: "Grand format A4, réglure Seyes grands carreaux, couverture cartonnée souple résistante. Idéal pour les élèves du primaire et secondaire.",
    stock: 120,
    quantite: 120
  },
  {
    id: 102,
    title: "Lot de 4 Stylos Bic Cristal (Noir, Bleu, Rouge, Vert)",
    supplier_name: "Stylos Bic Cristal x4",
    prix_vente: 500,
    prix: 500,
    category_id: "ecriture",
    category: "ecriture",
    image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=600",
    image_url: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=600",
    description: "Stylos à bille classiques pointe moyenne. Écriture propre et régulière, grande longévité.",
    stock: 300,
    quantite: 300
  },
  {
    id: 103,
    title: "Sac à dos ergonomique renforcé",
    supplier_name: "Sac à dos renforcé",
    prix_vente: 12500,
    prix: 12500,
    category_id: "bagagerie",
    category: "bagagerie",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600",
    image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600",
    description: "Grand sac avec compartiments multiples, bretelles rembourrées, fond imperméable anti-déchirure. Parfait pour transporter les manuels lourds.",
    stock: 24,
    quantite: 24
  },
  {
    id: 104,
    title: "Boîte de 12 Crayons de Couleur Premium",
    supplier_name: "Crayons de Couleur x12",
    prix_vente: 1500,
    prix: 1500,
    category_id: "dessin",
    category: "dessin",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600",
    image_url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600",
    description: "Mines tendres pigmentées extra-résistantes à la casse. Rendu de couleur vif, idéal pour le dessin artistique à l'école.",
    stock: 80,
    quantite: 80
  }
];

// Initial mock chronicles
export const mockChroniques = [
  {
    id: 1,
    reference: "poussiere-dakar",
    title: "Poussière sur Dakar",
    description: "Un polar urbain palpitant au cœur du quartier de la Médina. Un jeune journaliste d'investigation déterre des secrets qui menacent les élites politiques du Sénégal.",
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600",
    chapters_count: 5,
    status: "En cours",
    views_count: 1024,
    nb_vues: 1024,
    created_at: "2026-05-10T10:00:00Z"
  },
  {
    id: 2,
    reference: "les-lianes-de-saly",
    title: "Les Lianes de Saly",
    description: "Une saga familiale captivante entre tradition et modernité, se déroulant dans la station balnéaire de Saly Portudal et sur la Petite-Côte.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600",
    chapters_count: 3,
    status: "Terminée",
    views_count: 765,
    nb_vues: 765,
    created_at: "2026-04-12T09:30:00Z"
  }
];

// Mock chapters per chronicle reference
export const mockChapters = {
  "poussiere-dakar": [
    {
      id: 11,
      numero: 1,
      title: "Chapitre 1 : L'appel de minuit",
      pages: [
        { content: "La nuit dakaroise était enveloppée d'une brume tiède et salée en provenance de l'Océan. Dans son petit bureau de la Médina, Birame écoutait le grincement régulier du ventilateur de plafond. L'écran de son ordinateur affichait l'ébauche de sa prochaine enquête sur le port autonome." },
        { content: "Soudain, le téléphone fixa retentit. Une voix haletante et méconnaissable lui dit de se rendre immédiatement près des falaises de la Corniche Ouest. 'Si vous voulez savoir ce qui est arrivé à l'archiviste, venez seul.' L'appel prit fin brutalement. Birame enfila sa veste de toile, conscient que sa curiosité risquait de briser la tranquillité de sa vie bien rangée." }
      ]
    },
    {
      id: 12,
      numero: 2,
      title: "Chapitre 2 : Les falaises de la Corniche",
      pages: [
        { content: "Birame gara sa vieille Peugeot en retrait des lampadaires. La Corniche Ouest, d'ordinaire animée de sportifs et de marchands ambulants, était déserte à cette heure avancée. Le ressac des vagues contre les falaises de basalte masquait le bruit de ses pas." },
        { content: "Au loin, sous les arches en béton inachevées du grand hôtel en chantier, une ombre fumait nerveusement. Il s'approcha doucement. L'inconnu jeta sa cigarette, révélant un visage creusé par la peur. C'était Ablaye, le neveu de l'archiviste disparu. 'Il a trouvé des dossiers datant de 1974, Birame. Des dossiers qu'il n'aurait jamais dû ouvrir.'" }
      ]
    },
    {
      id: 13,
      numero: 3,
      title: "Chapitre 3 : L'ombre de la Médina",
      pages: [
        { content: "La rencontre sur la corniche n'avait fait que soulever d'autres questions. Ablaye s'était enfui à l'approche de phares suspects. Birame décida de retourner à la Médina, là où son instinct lui disait de chercher." },
        { content: "En marchant dans les ruelles étroites où s'éteignaient les derniers échos des tams-tams d'un mariage de quartier, il se sentit suivi. Un pick-up blanc, vitres teintées, roulait au pas derrière lui. Il tourna brusquement à l'angle de la rue 22, s'engouffra dans une cour commune familière et retint son souffle derrière le grand portail de fer forgé." }
      ]
    },
    {
      id: 14,
      numero: 4,
      title: "Chapitre 4 : Les archives brûlées",
      pages: [
        { content: "Le lendemain matin, une colonne de fumée noire s'élevait au-dessus du centre-ville. Le bâtiment annexe du ministère, abritant les archives historiques nationales, était la proie des flammes." },
        { content: "Birame, caché parmi les badauds et les journalistes, observa les pompiers lutter contre le sinistre. Les documents révélés par Ablaye la veille avaient disparu dans ce brasier opportun. Quelqu'un s'efforçait de réécrire l'histoire ou d'en effacer les preuves compromettantes. Birame comprit alors que l'enquête n'était plus seulement journalistique : elle était devenue une course pour sa propre survie." }
      ]
    },
    {
      id: 15,
      numero: 5,
      title: "Chapitre 5 : Le prix de la vérité",
      pages: [
        { content: "Trois jours après l'incendie, Birame prit sa décision. Il rédigea son article final, étayé par les quelques notes manuscrites qu'Ablaye lui avait confiées sur la corniche. Il savait qu'une fois publié, sa vie à Dakar ne serait plus jamais la même." },
        { content: "Son éditeur hésita, conscient des implications politiques massives. Mais le devoir de vérité l'emporta. L'édition spéciale fut imprimée à l'aube. Dans les kiosques de la place de l'Indépendance, les titres s'arrachaient déjà. Birame, quant à lui, montait à bord du ferry de Gorée, cherchant un moment de répit dans le silence de l'île de mémoire, en attendant la tempête." }
      ]
    }
  ],
  "les-lianes-de-saly": [
    {
      id: 21,
      numero: 1,
      title: "Chapitre 1 : Le retour à la mer",
      pages: [
        { content: "Après dix ans passés dans la grisaille parisienne, Aminata reposait enfin ses pieds sur le sable brûlant de Saly. La Petite-Côte n'avait rien perdu de sa lumière dorée, bien que le tourisme ait remodelé les pourtours du village d'origine." },
        { content: "Elle venait reprendre la gestion de la résidence hôtelière de son défunt grand-père, un patriarche respecté de tous. Cependant, à peine arrivée, son oncle maternel lui fit comprendre que son retour d'Europe n'était pas vu d'un bon œil par toute la famille." }
      ]
    },
    {
      id: 22,
      numero: 2,
      title: "Chapitre 2 : La succession contestée",
      pages: [
        { content: "La réunion de famille eut lieu sous le grand baobab de la cour familiale à Mbour. L'atmosphère était lourde." },
        { content: "Les oncles réclamaient la vente des terrains de Saly pour combler des dettes imaginaires, tandis qu'Aminata brandissait le testament écrit. Les lianes du passé familial se resserraient. Secrets de famille enfouis, rivalités fraternelles et convoitises foncières se heurtaient aux convictions de la jeune femme." }
      ]
    },
    {
      id: 23,
      numero: 3,
      title: "Chapitre 3 : La nouvelle aube",
      pages: [
        { content: "Malgré l'opposition des siens, Aminata décida de lancer les travaux de rénovation de la résidence. Avec l'aide des pêcheurs locaux et de ses amies d'enfance, elle reconstruisit les pontons en bois et modernisa les bungalows en privilégiant l'artisanat sénégalais." },
        { content: "Lors de l'inauguration, la réussite fut totale, prouvant que l'héritage pouvait se réinventer avec respect. Les lianes de Saly ne l'avaient pas étouffée, elles l'avaient ancrée plus solidement au sol de ses ancêtres." }
      ]
    }
  ]
};

// Mock blog articles
export const mockArticles = [
  {
    id: 1,
    type: "chronique",
    title: "Le renouveau de la littérature sénégalaise en 2026",
    content: "La littérature sénégalaise connaît une effervescence créative sans précédent. Portée par une nouvelle génération de romanciers, d'essayistes et d'auteurs de BD, elle s'affranchit des anciens codes pour raconter des récits locaux à portée universelle.\n\nDes structures d'édition indépendantes fleurissent à Dakar et à Saint-Louis, favorisant l'émergence de plumes audacieuses qui s'expriment en français ainsi qu'en wolof. Ce souffle nouveau se caractérise par des genres diversifiés : du polar urbain à la science-fiction spéculative. Bëgg Lire s'engage fièrement à propulser ces voix uniques.",
    author_id: 201,
    fullname: "Aminata Ndiaye",
    vendeur: "Aminata Ndiaye",
    image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=600",
    created_at: "2026-06-01T14:30:00Z"
  },
  {
    id: 2,
    type: "regard",
    title: "Mariama Bâ : La voix éternelle de l'émancipation",
    content: "Plus de quarante ans après sa publication, 'Une si longue lettre' demeure une lecture essentielle et moderne. En analysant la correspondance intime de Ramatoulaye, ce chef-d'œuvre dénonce les inégalités du droit de la famille et prône une sororité salvatrice.\n\nMariama Bâ a su mettre des mots justes sur la solitude de la femme intellectuelle prise au piège des coutumes détournées. Son héritage continue d'inspirer les luttes contemporaines pour l'égalité d'accès à l'éducation au Sénégal.",
    author_id: 202,
    fullname: "Dr. Babacar Diop",
    vendeur: "Dr. Babacar Diop",
    image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=600",
    created_at: "2026-05-18T11:00:00Z"
  }
];

// Featured author
export const mockAuteurSemaine = {
  id: 12,
  name: "Mariama Bâ",
  fullname: "Mariama Bâ",
  bio: "Née à Dakar en 1929 et disparue en 1981, Mariama Bâ est une pionnière des lettres sénégalaises. Éducatrice et militante féministe, son œuvre dépeint de façon intime et politique la condition sociale des femmes africaines, laissant une empreinte indélébile dans l'histoire de la littérature francophone.",
  photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400", // Portrait mock
  created_at: "2026-06-12T00:00:00Z"
};

// ==========================================
// 2. USER & ORDER SESSIONS (Stateful In-Memory)
// ==========================================

export let mockCurrentUser = {
  id: 42,
  prenom: "Awa",
  nom: "Diop",
  fullname: "Awa Diop",
  email: "test@begglire.sn",
  telephone: "+221 77 123 45 67",
  adresse: "Fann Résidence",
  ville: "Dakar",
  commune: "Fann - Point E - Amitié"
};

export let mockOrders = [
  {
    id: 501,
    reference: "CMD-2026-8902",
    date: "2026-06-02",
    created_at: "2026-06-02T15:00:00Z",
    total: 9000,
    prix_total: 9000,
    statut: "Livrée",
    status: "Livrée",
    type_payement: "wave",
    client: "Awa Diop",
    email: "test@begglire.sn",
    telephone: "+221 77 123 45 67",
    locality: "Point E - Rue 4",
    title: "Une si longue lettre",
    prix: 4500,
    prix_vente: 4500,
    quantity: 2,
    type: "Livre",
    isbn: "9782708703797"
  },
  {
    id: 502,
    reference: "CMD-2026-9141",
    date: "2026-06-10",
    created_at: "2026-06-10T11:45:00Z",
    total: 3500,
    prix_total: 3500,
    statut: "En cours de livraison",
    status: "En cours de livraison",
    type_payement: "livraison",
    client: "Awa Diop",
    email: "test@begglire.sn",
    telephone: "+221 77 123 45 67",
    locality: "Point E - Rue 4",
    title: "Les Frasques d'Ebinto",
    prix: 3500,
    prix_vente: 3500,
    quantity: 1,
    type: "Livre",
    isbn: "9782708200609"
  }
];

export let mockWishlist = [
  mockBooks[1], // L'Aventure ambiguë
  mockBooks[2]  // La plus secrète mémoire des hommes
];

// ==========================================
// 3. MUTATION HANDLERS
// ==========================================

export const updateMockPassword = (newPassword) => {
  console.log("Mock: password changed to", newPassword);
  return { success: true, message: "Mot de passe mis à jour avec succès (mock)." };
};

export const updateMockProfile = (updatedProfile) => {
  mockCurrentUser = { ...mockCurrentUser, ...updatedProfile };
  return { success: true, data: mockCurrentUser };
};

export const addToMockWishlist = (bookId) => {
  const book = mockBooks.find(b => b.id === Number(bookId));
  if (book && !mockWishlist.some(b => b.id === book.id)) {
    mockWishlist.push(book);
  }
  return { success: true, data: mockWishlist.length };
};

export const removeFromMockWishlist = (bookId) => {
  mockWishlist = mockWishlist.filter(b => b.id !== Number(bookId));
  return { success: true, data: mockWishlist.length };
};

export const checkMockWishlist = (bookId) => {
  const exists = mockWishlist.some(b => b.id === Number(bookId));
  return { success: true, is_in_wishlist: exists, data: exists };
};

export const addMockBookForSale = (bookData) => {
  const newId = mockBooks.length > 0 ? Math.max(...mockBooks.map(b => b.id)) + 1 : 1;
  const newBook = {
    id: newId,
    titre: bookData.get("titre") || bookData.titre || "Livre sans titre",
    auteur: bookData.get("auteur") || bookData.auteur || "Auteur inconnu",
    prix_vente: Number(bookData.get("prix_vente") || bookData.prix_vente || 5000),
    prix: Number(bookData.get("prix_vente") || bookData.prix_vente || 5000),
    category_id: Number(bookData.get("category_id") || bookData.category_id || 1),
    category: mockCategories.find(c => c.id === Number(bookData.get("category_id") || bookData.category_id)) || { id: 1, name: "Littérature" },
    image: bookData.get("image_link") || bookData.image_link || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600",
    image_link: bookData.get("image_link") || bookData.image_link || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600",
    description: bookData.get("description") || bookData.description || "Description de l'ouvrage.",
    etat_livre: bookData.get("etat_livre") || bookData.etat_livre || "Neuf",
    etat: bookData.get("etat_livre") || bookData.etat_livre || "Neuf",
    stock: Number(bookData.get("nombre_exemplaire") || bookData.nombre_exemplaire || 1),
    quantite: Number(bookData.get("nombre_exemplaire") || bookData.nombre_exemplaire || 1),
    views_count: 0,
    nb_vues: 0,
    isbn: bookData.get("isbn") || bookData.isbn || "9781111111111",
    is_featured: false
  };

  mockBooks.unshift(newBook); // Prepend to show up first in "recent" listing
  return { success: true, message: "Livre mis en vente avec succès !", data: newBook };
};

export const placeMockOrder = (payload, orderType = "mixed") => {
  const ref = `CMD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateStr = new Date().toISOString().split("T")[0];

  const clientName = mockCurrentUser.fullname;
  const clientEmail = mockCurrentUser.email;
  const clientPhone = mockCurrentUser.telephone;
  const clientLoc = payload.locality || payload.commune || mockCurrentUser.commune;

  let totalAmount = 0;

  // Compile items
  if (orderType === "book" && payload.books) {
    payload.books.forEach(b => {
      totalAmount += Number(b.prix_vente) * Number(b.quantity);
      mockOrders.unshift({
        id: mockOrders.length + 1000,
        reference: ref,
        date: dateStr,
        created_at: new Date().toISOString(),
        total: totalAmount,
        prix_total: totalAmount,
        statut: "En attente de traitement",
        status: "En attente de traitement",
        type_payement: "livraison",
        client: clientName,
        email: clientEmail,
        telephone: clientPhone,
        locality: clientLoc,
        title: b.title,
        prix: Number(b.prix_vente),
        prix_vente: Number(b.prix_vente),
        quantity: b.quantity,
        type: "Livre",
        isbn: b.isbn
      });
    });
  } 
  else if (orderType === "supply" && payload.supplies) {
    payload.supplies.forEach(s => {
      totalAmount += Number(s.prix) * Number(s.quantity);
      mockOrders.unshift({
        id: mockOrders.length + 1000,
        reference: ref,
        date: dateStr,
        created_at: new Date().toISOString(),
        total: totalAmount,
        prix_total: totalAmount,
        statut: "En attente de traitement",
        status: "En attente de traitement",
        type_payement: "livraison",
        client: clientName,
        email: clientEmail,
        telephone: clientPhone,
        locality: clientLoc,
        title: s.supplier_name,
        prix: Number(s.prix),
        prix_vente: Number(s.prix),
        quantity: s.quantity,
        type: "Fourniture",
        isbn: ""
      });
    });
  }
  else {
    // Mixed
    if (payload.livres) {
      payload.livres.forEach(b => {
        totalAmount += Number(b.prix_vente) * Number(b.quantity);
        mockOrders.unshift({
          id: mockOrders.length + 1000,
          reference: ref,
          date: dateStr,
          created_at: new Date().toISOString(),
          total: totalAmount,
          prix_total: totalAmount,
          statut: "En attente de traitement",
          status: "En attente de traitement",
          type_payement: "livraison",
          client: clientName,
          email: clientEmail,
          telephone: clientPhone,
          locality: clientLoc,
          title: b.title,
          prix: Number(b.prix_vente),
          prix_vente: Number(b.prix_vente),
          quantity: b.quantity,
          type: "Livre",
          isbn: b.isbn
        });
      });
    }
    if (payload.fournitures) {
      payload.fournitures.forEach(s => {
        totalAmount += Number(s.prix) * Number(s.quantity);
        mockOrders.unshift({
          id: mockOrders.length + 1000,
          reference: ref,
          date: dateStr,
          created_at: new Date().toISOString(),
          total: totalAmount,
          prix_total: totalAmount,
          statut: "En attente de traitement",
          status: "En attente de traitement",
          type_payement: "livraison",
          client: clientName,
          email: clientEmail,
          telephone: clientPhone,
          locality: clientLoc,
          title: s.supplier_name,
          prix: Number(s.prix),
          prix_vente: Number(s.prix),
          quantity: s.quantity,
          type: "Fourniture",
          isbn: ""
        });
      });
    }
  }

  // Update total on created entries
  mockOrders.forEach(o => {
    if (o.reference === ref) {
      o.total = totalAmount;
      o.prix_total = totalAmount;
    }
  });

  return { success: true, reference: ref, data: { reference: ref } };
};

// ==========================================
// 3. BLOGGER, COMMENTS & REACTIONS MOCK STATE
// ==========================================

export let mockBloggerCandidacy = null; // null | { status: "pending", date: string, data: object }

export let mockComments = [
  { id: 1, type: "blog", target_id: 1, name: "Ibrahima Sarr", email: "ibra@gmail.com", content: "Excellent article sur la dynamique littéraire à Dakar !", created_at: "2026-06-02T10:00:00Z" },
  { id: 2, type: "blog", target_id: 1, name: "Fatou Kiné", email: "fatou@hotmail.com", content: "Très d'accord avec votre analyse, particulièrement sur l'émergence de la science-fiction.", created_at: "2026-06-03T14:20:00Z" },
  { id: 3, type: "chronique", target_id: 1, name: "Moustapha Sall", email: "mustapha@gmail.com", content: "J'attends le prochain chapitre avec tellement d'impatience !", created_at: "2026-05-11T12:00:00Z" }
];

export let mockReactions = {
  "blog_1": 42,
  "blog_2": 28,
  "chronique_poussiere-dakar": 115,
  "chronique_les-lianes-de-saly": 56
};

// Helpers for comments
export const getMockComments = (type, id) => {
  const filtered = mockComments.filter(
    c => c.type === String(type).toLowerCase() && String(c.target_id) === String(id)
  );
  return { success: true, data: filtered };
};

export const addMockComment = (payload) => {
  const newComment = {
    id: mockComments.length + 1,
    type: String(payload.type).toLowerCase(),
    target_id: String(payload.target_id),
    name: payload.name || "Anonyme",
    email: payload.email || "",
    content: payload.content || "",
    created_at: new Date().toISOString()
  };
  mockComments.push(newComment);
  return { success: true, message: "Commentaire en attente de modération", data: newComment };
};

// Helpers for reactions
export const getMockReactions = (type, id) => {
  const key = `${String(type).toLowerCase()}_${id}`;
  return { success: true, count: mockReactions[key] || 0 };
};

export const addMockReaction = (type, id) => {
  const key = `${String(type).toLowerCase()}_${id}`;
  if (!mockReactions[key]) {
    mockReactions[key] = 0;
  }
  mockReactions[key] += 1;
  return { success: true, count: mockReactions[key] };
};

// Helpers for blogger candidacy
export const submitBloggerApplication = (payload) => {
  mockBloggerCandidacy = {
    status: "pending",
    date: new Date().toISOString(),
    data: payload
  };
  return { success: true, message: "Candidature envoyée avec succès" };
};

export const getBloggerApplicationStatus = () => {
  if (!mockBloggerCandidacy) {
    return { success: true, has_application: false };
  }
  return {
    success: true,
    has_application: true,
    status: mockBloggerCandidacy.status,
    date: mockBloggerCandidacy.date,
    data: mockBloggerCandidacy.data
  };
};

export const getBloggerStats = () => {
  // Let's return some realistic blogger stats
  return {
    success: true,
    data: {
      total_publications: 4,
      total_views: 1845,
      total_comments: 14,
      most_read: {
        title: "Le renouveau de la littérature sénégalaise en 2026",
        views: 1024
      },
      chart_data: [
        { name: "Littérature 2026", views: 1024 },
        { name: "Mariama Bâ Éternelle", views: 765 },
        { name: "Mon Premier Polar", views: 420 },
        { name: "Saly et ses secrets", views: 250 }
      ],
      top_publications: [
        { rank: 1, title: "Le renouveau de la littérature sénégalaise en 2026", type: "blog", views: 1024 },
        { rank: 2, title: "Mariama Bâ : La voix éternelle de l'émancipation", type: "blog", views: 765 },
        { rank: 3, title: "Poussière sur Dakar (Chronique)", type: "chronique", views: 420 },
        { rank: 4, title: "Les Lianes de Saly (Chronique)", type: "chronique", views: 250 }
      ]
    }
  };
};

// ==========================================
// 4. BOOK SELLING & SUBMISSIONS MOCK STATE
// ==========================================

export let mockSoumissions = [
  {
    id: 1,
    titre: "L'Aventure Ambiguë",
    auteur: "Cheikh Hamidou Kane",
    isbn: "9782070360024",
    prix: 2500,
    etat: "tres_bon",
    quantite: 1,
    type_exemplaire: "unique",
    statut: "approuve",
    cover: "https://covers.openlibrary.org/b/isbn/9782070360024-M.jpg",
    created_at: "2026-05-10",
    categorie: "Littérature africaine"
  },
  {
    id: 2,
    titre: "Sous l'Orage",
    auteur: "Seydou Badian",
    isbn: "",
    prix: 1500,
    etat: "bon",
    quantite: 3,
    type_exemplaire: "stock",
    statut: "en_attente",
    cover: null,
    created_at: "2026-06-01",
    categorie: "Roman"
  },
  {
    id: 3,
    titre: "Xala",
    auteur: "Ousmane Sembène",
    isbn: "",
    prix: 3000,
    etat: "neuf",
    quantite: 1,
    type_exemplaire: "unique",
    statut: "refuse",
    motif_refus: "Prix trop élevé par rapport à l'état indiqué. Veuillez revoir votre tarif ou corriger l'état du livre.",
    cover: null,
    created_at: "2026-05-20",
    categorie: "Roman"
  },
  {
    id: 4,
    titre: "Les Bouts de Bois de Dieu",
    auteur: "Ousmane Sembène",
    isbn: "9782266014199",
    prix: 2000,
    etat: "tres_bon",
    quantite: 2,
    type_exemplaire: "stock",
    statut: "en_attente",
    cover: "https://covers.openlibrary.org/b/isbn/9782266014199-M.jpg",
    created_at: "2026-06-10",
    categorie: "Littérature africaine"
  }
];

const loadSoumissions = () => {
  if (typeof window === "undefined" || !window.localStorage) return mockSoumissions;
  const data = localStorage.getItem("mock_soumissions");
  if (data) {
    try { return JSON.parse(data); } catch(e) {}
  }
  localStorage.setItem("mock_soumissions", JSON.stringify(mockSoumissions));
  return mockSoumissions;
};

export const getMockSoumissions = () => {
  return { success: true, data: loadSoumissions() };
};

export const addMockSoumission = (payload) => {
  const list = loadSoumissions();
  const newItem = {
    id: list.length > 0 ? Math.max(...list.map(x => x.id)) + 1 : 1,
    titre: payload.titre || payload.title || "",
    auteur: payload.auteur || payload.author || "",
    isbn: payload.isbn || "",
    prix: Number(payload.prix || payload.prix_vente) || 0,
    etat: payload.etat || payload.etat_livre || "bon",
    quantite: Number(payload.quantite || payload.nombre_exemplaire) || 1,
    type_exemplaire: payload.type_exemplaire || (Number(payload.nombre_exemplaire) > 1 ? "stock" : "unique"),
    statut: "en_attente",
    cover: payload.cover || payload.image_link || null,
    created_at: new Date().toISOString().split("T")[0],
    categorie: payload.categorie || "Roman"
  };
  list.unshift(newItem);
  localStorage.setItem("mock_soumissions", JSON.stringify(list));
  return { success: true, data: newItem };
};

export const updateMockSoumission = (id, payload) => {
  const list = loadSoumissions();
  const idx = list.findIndex(x => x.id === Number(id));
  if (idx !== -1) {
    list[idx] = {
      ...list[idx],
      titre: payload.titre || payload.title || list[idx].titre,
      auteur: payload.auteur || payload.author || list[idx].auteur,
      isbn: payload.isbn !== undefined ? payload.isbn : list[idx].isbn,
      prix: Number(payload.prix || payload.prix_vente) || list[idx].prix,
      etat: payload.etat || payload.etat_livre || list[idx].etat,
      quantite: Number(payload.quantite || payload.nombre_exemplaire) || list[idx].quantite,
      type_exemplaire: payload.type_exemplaire || (Number(payload.nombre_exemplaire) > 1 ? "stock" : "unique") || list[idx].type_exemplaire,
      cover: payload.cover || payload.image_link || list[idx].cover,
      categorie: payload.categorie || list[idx].categorie,
      statut: list[idx].statut === "refuse" ? "en_attente" : list[idx].statut
    };
    localStorage.setItem("mock_soumissions", JSON.stringify(list));
    return { success: true, data: list[idx] };
  }
  return { success: false, message: "Soumission introuvable" };
};

export const deleteMockSoumission = (id) => {
  let list = loadSoumissions();
  list = list.filter(x => x.id !== Number(id));
  localStorage.setItem("mock_soumissions", JSON.stringify(list));
  return { success: true };
};
;

