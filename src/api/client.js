import axios from "axios";
import * as mockDb from "./mockData";

// Read API Base URL from Vite environment variables (fallback to localhost)
const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:8000/api";

// Read Image Base URL (Laravel storage)
export const IMAGE_URL = import.meta.env?.VITE_IMAGE_URL || "http://localhost:8000/storage";

// Create Axios client instance
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

/**
 * Retrieves or generates a session token stored in sessionStorage
 * for view deduplication (persists only for the duration of the page session).
 */
const getOrCreateSessionToken = () => {
  if (typeof window === "undefined" || !window.sessionStorage) return "";

  let sessionToken = sessionStorage.getItem("bl_session_token");
  if (!sessionToken) {
    sessionToken = "bl_session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem("bl_session_token", sessionToken);
  }
  return sessionToken;
};

// Request Interceptor: Attach JWT Token & Session Token (still runs, useful if hitting real API)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const sessionToken = getOrCreateSessionToken();
    if (sessionToken) {
      config.headers["X-Session-Token"] = sessionToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 Unauthorized errors (for real API auth expiry)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (typeof window !== "undefined") {
        window.location.href = "/connexion";
      }
    }
    return Promise.reject(error);
  }
);

// Save the original adapter
const defaultAdapter = apiClient.defaults.adapter || axios.defaults.adapter;

// Custom Mocking Adapter
apiClient.defaults.adapter = async (config) => {
  const useMock = import.meta.env?.VITE_USE_MOCK !== "false";

  if (!useMock) {
    // If mocking is disabled, fall back to standard HTTP/XHR adapter
    return defaultAdapter(config);
  }

  // Normalize request path relative to '/api' prefix
  let normalizedPath = config.url || "";
  if (normalizedPath.startsWith(config.baseURL)) {
    normalizedPath = normalizedPath.substring(config.baseURL.length);
  }
  if (normalizedPath.startsWith("http://") || normalizedPath.startsWith("https://")) {
    try {
      const parsed = new URL(normalizedPath);
      normalizedPath = parsed.pathname;
      if (normalizedPath.startsWith("/api")) {
        normalizedPath = normalizedPath.substring(4);
      }
    } catch (e) {}
  }

  // Clean up double slashes or leading slashes
  if (!normalizedPath.startsWith("/")) {
    normalizedPath = "/" + normalizedPath;
  }

  // Parse search params
  const urlObj = new URL(config.url || "", "http://localhost");
  const params = Object.fromEntries(urlObj.searchParams.entries());

  const method = config.method ? config.method.toLowerCase() : "get";
  let data = null;
  let status = 200;

  // ROUTING HANDLERS
  if (normalizedPath === "/me" && method === "get") {
    const token = localStorage.getItem("token");
    if (token) {
      data = { success: true, data: mockDb.mockCurrentUser };
    } else {
      status = 401;
      data = { success: false, message: "Non autorisé (session de mock vide)." };
    }
  } 
  else if (normalizedPath === "/login" && method === "post") {
    const body = JSON.parse(config.data || "{}");
    if (body.email === "test@begglire.sn" && body.password === "password") {
      data = {
        success: true,
        access_token: "mock-jwt-token-awa-diop",
        data: mockDb.mockCurrentUser
      };
    } else {
      status = 401;
      data = { success: false, message: "Email ou mot de passe incorrect. (Utiliser test@begglire.sn / password)." };
    }
  } 
  else if (normalizedPath === "/register" && method === "post") {
    const body = JSON.parse(config.data || "{}");
    data = {
      success: true,
      message: "Inscription réussie !",
      data: {
        id: 42,
        prenom: body.prenom || "Awa",
        nom: body.nom || "Diop",
        email: body.email || "test@begglire.sn"
      }
    };
  } 
  else if (normalizedPath === "/logout" && method === "post") {
    data = { success: true };
  } 
  else if (normalizedPath.startsWith("/vente-livres/")) {
    const category = normalizedPath.split("/")[2];
    if (category === "tous" || category === "tous-livres") {
      data = { success: true, data: mockDb.mockBooks };
    } else if (category === "selection" || category === "recent" || category === "selection_semaine" || category === "livres_a_la_une") {
      // Return a slice to simulate filters
      data = { success: true, data: mockDb.mockBooks.slice(0, 4) };
    } else {
      data = { success: true, data: mockDb.mockBooks };
    }
  } 
  else if (normalizedPath.startsWith("/vente-livres-category/")) {
    const catId = Number(normalizedPath.split("/")[2]);
    const filtered = mockDb.mockBooks.filter(b => b.category_id === catId);
    data = { success: true, data: filtered };
  }
  else if (normalizedPath.startsWith("/livre-en-vente/")) {
    const parts = normalizedPath.split("/");
    const id = Number(parts[2]);

    if (parts[3] === "vue" && method === "post") {
      const book = mockDb.mockBooks.find(b => b.id === id);
      if (book) {
        book.views_count = (book.views_count || 0) + 1;
        book.nb_vues = book.views_count;
      }
      data = { success: true, message: "Vue enregistrée." };
    } else if (method === "get") {
      const book = mockDb.mockBooks.find(b => b.id === id);
      if (book) {
        data = { success: true, data: book };
      } else {
        status = 404;
        data = { success: false, message: "Livre introuvable." };
      }
    }
  } 
  else if (normalizedPath.startsWith("/related-book/")) {
    const id = Number(normalizedPath.split("/")[2]);
    const book = mockDb.mockBooks.find(b => b.id === id);
    const filtered = mockDb.mockBooks.filter(b => b.id !== id && (!book || b.category_id === book.category_id));
    data = { success: true, data: filtered.slice(0, 4) };
  } 
  else if (normalizedPath.startsWith("/get-book-moment/")) {
    const featured = mockDb.mockBooks.filter(b => b.is_featured);
    data = { success: true, data: featured.length > 0 ? featured : mockDb.mockBooks.slice(0, 2) };
  } 
  else if (normalizedPath.startsWith("/search-book")) {
    const query = (config.params?.query || params.query || "").toLowerCase();
    const filtered = mockDb.mockBooks.filter(
      b => b.titre.toLowerCase().includes(query) || b.auteur.toLowerCase().includes(query)
    );
    data = { success: true, data: filtered };
  } 
  else if (normalizedPath === "/category/all") {
    data = { success: true, data: mockDb.mockCategories };
  } 
  else if (normalizedPath === "/school-supplies") {
    data = { success: true, data: mockDb.mockSupplies };
  } 
  else if (normalizedPath === "/school-supply-categories") {
    data = { success: true, data: mockDb.mockSupplyCategories };
  } 
  else if (normalizedPath.startsWith("/school-supply/")) {
    const id = Number(normalizedPath.split("/")[2]);
    const supply = mockDb.mockSupplies.find(s => s.id === id);
    if (supply) {
      data = { success: true, data: supply };
    } else {
      status = 404;
      data = { success: false, message: "Fourniture introuvable." };
    }
  } 
  else if (normalizedPath === "/articles") {
    data = { success: true, data: mockDb.mockArticles };
  } 
  else if (normalizedPath.startsWith("/read-article/")) {
    const parts = normalizedPath.split("/");
    const id = Number(parts[3]);
    const article = mockDb.mockArticles.find(a => a.id === id);
    if (article) {
      data = { success: true, data: article };
    } else {
      status = 404;
      data = { success: false, message: "Article introuvable." };
    }
  } 
  else if (normalizedPath === "/chroniques") {
    data = { success: true, data: mockDb.mockChroniques };
  } 
  else if (normalizedPath.startsWith("/chronique/")) {
    const ref = normalizedPath.split("/")[2];
    const chronicle = mockDb.mockChroniques.find(c => c.reference === ref);
    if (chronicle) {
      data = { success: true, data: chronicle };
    } else {
      status = 404;
      data = { success: false, message: "Chronique introuvable." };
    }
  } 
  else if (normalizedPath.startsWith("/chroniques/get-chapters/")) {
    const ref = normalizedPath.split("/")[3];
    const chapters = mockDb.mockChapters[ref] || [];
    data = { success: true, data: chapters };
  } 
  else if (normalizedPath === "/auteurs-semaine/current") {
    data = { success: true, data: mockDb.mockAuteurSemaine };
  } 
  else if (normalizedPath.startsWith("/author-articles/")) {
    const authorId = Number(normalizedPath.split("/")[2]);
    const filtered = mockDb.mockArticles.filter(a => a.author_id === authorId || authorId === 12);
    data = { success: true, data: filtered };
  } 
  else if (normalizedPath === "/wishlist/count") {
    data = { success: true, data: mockDb.mockWishlist.length };
  } 
  else if (normalizedPath === "/wishlist" && method === "get") {
    data = { success: true, data: { books: mockDb.mockWishlist } };
  } 
  else if (normalizedPath === "/wishlist/check" && method === "post") {
    const body = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data;
    data = mockDb.checkMockWishlist(body.book_id);
  } 
  else if (normalizedPath === "/wishlist/add" && method === "post") {
    const body = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data;
    data = mockDb.addToMockWishlist(body.book_id);
  } 
  else if (normalizedPath === "/wishlist/remove" && method === "post") {
    const body = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data;
    data = mockDb.removeFromMockWishlist(body.book_id);
  } 
  else if (normalizedPath === "/mes-commandes") {
    data = { success: true, data: mockDb.mockOrders };
  } 
  else if (normalizedPath.startsWith("/show-command/")) {
    const ref = normalizedPath.split("/")[2];
    const items = mockDb.mockOrders.filter(o => o.reference === ref && o.type === "Livre");
    data = { success: true, data: items };
  } 
  else if (normalizedPath.startsWith("/show-supply-command/")) {
    const ref = normalizedPath.split("/")[2];
    const items = mockDb.mockOrders.filter(o => o.reference === ref && o.type === "Fourniture");
    data = { success: true, data: items };
  } 
  else if (normalizedPath === "/cart-command" && method === "post") {
    const body = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data;
    data = mockDb.placeMockOrder(body, "book");
  } 
  else if (normalizedPath === "/cart-supply-command" && method === "post") {
    const body = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data;
    data = mockDb.placeMockOrder(body, "supply");
  } 
  else if (normalizedPath === "/mixed-cart" && method === "post") {
    const body = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data;
    data = mockDb.placeMockOrder(body, "mixed");
  } 
  else if (normalizedPath === "/paytech/payment" && method === "post") {
    const body = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data;
    data = {
      success: true,
      redirect_url: `/commande/${body.ref_command}`
    };
  } 
  else if (normalizedPath === "/payment-delivery" && method === "post") {
    data = { success: true };
  } 
  else if (normalizedPath === "/user/update" && (method === "post" || method === "put")) {
    const body = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data;
    data = mockDb.updateMockPassword(body.password);
  } 
  else if (normalizedPath === "/vendre-livre" && method === "get") {
    data = mockDb.getMockSoumissions();
  }
  else if (normalizedPath === "/vendre-livre" && method === "post") {
    let payload = config.data;
    if (payload instanceof FormData) {
      const obj = {};
      payload.forEach((value, key) => {
        obj[key] = value;
      });
      payload = obj;
    } else {
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch (e) {}
      }
    }
    data = mockDb.addMockSoumission(payload);
  }
  else if (normalizedPath.startsWith("/vendre-livre/") && method === "put") {
    const id = normalizedPath.split("/")[2];
    const body = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data;
    data = mockDb.updateMockSoumission(id, body);
  }
  else if (normalizedPath.startsWith("/vendre-livre/") && method === "delete") {
    const id = normalizedPath.split("/")[2];
    data = mockDb.deleteMockSoumission(id);
  } 
  else if (normalizedPath === "/newsletter/subscribe" && method === "post") {
    data = { success: true, message: "Merci pour votre inscription à notre newsletter !" };
  }
  else if (normalizedPath.startsWith("/comments/") && method === "get") {
    const parts = normalizedPath.split("/");
    const type = parts[2];
    const id = parts[3];
    data = mockDb.getMockComments(type, id);
  }
  else if ((normalizedPath === "/comments/guest" || normalizedPath === "/comments/auth") && method === "post") {
    const body = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data;
    data = mockDb.addMockComment(body);
  }
  else if ((normalizedPath === "/reactions/guest" || normalizedPath === "/reactions/auth") && method === "post") {
    const body = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data;
    data = mockDb.addMockReaction(body.type, body.id);
  }
  else if (normalizedPath === "/blogger/apply" && method === "post") {
    const body = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data;
    data = mockDb.submitBloggerApplication(body);
  }
  else if (normalizedPath === "/blogger/application-status" && method === "get") {
    data = mockDb.getBloggerApplicationStatus();
  }
  else if ((normalizedPath === "/blogger/my-articles" || normalizedPath === "/get-articles-user") && method === "get") {
    data = { success: true, data: mockDb.mockArticles };
  }
  else if ((normalizedPath === "/blogger/create-article" || normalizedPath === "/create-article" || normalizedPath === "/submit-article") && method === "post") {
    let payload = config.data;
    if (payload instanceof FormData) {
      const obj = {};
      payload.forEach((value, key) => { obj[key] = value; });
      payload = obj;
    } else if (typeof payload === "string") {
      try { payload = JSON.parse(payload); } catch (e) {}
    }
    const newArt = {
      id: mockDb.mockArticles.length + 1,
      type: "regard",
      titre: payload.titre || payload.title || "Nouvel article",
      title: payload.titre || payload.title || "Nouvel article",
      contenu: payload.contenu || payload.content || "",
      content: payload.contenu || payload.content || "",
      image: payload.image || "",
      created_at: new Date().toISOString(),
      auteur: { fullname: "Awa Diop" },
      views_count: 0,
      comments_count: 0
    };
    mockDb.mockArticles.unshift(newArt);
    data = { success: true, message: "Article créé avec succès.", data: newArt };
  }
  else if (normalizedPath === "/blogger/create-review" && method === "post") {
    const body = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data;
    const newArt = {
      id: mockDb.mockArticles.length + 1,
      type: "regard",
      titre: `Critique : ${body.title || "Livre"}`,
      title: `Critique : ${body.title || "Livre"}`,
      contenu: body.content || "",
      content: body.content || "",
      created_at: new Date().toISOString(),
      auteur: { fullname: "Awa Diop" },
      views_count: 0,
      comments_count: 0,
      rating: body.rating || 5
    };
    mockDb.mockArticles.unshift(newArt);
    data = { success: true, message: "Review créée avec succès.", data: newArt };
  }
  else if ((normalizedPath === "/blogger/create-chronique" || normalizedPath === "/create-chronique") && method === "post") {
    let payload = config.data;
    if (payload instanceof FormData) {
      const obj = {};
      payload.forEach((value, key) => { obj[key] = value; });
      payload = obj;
    } else if (typeof payload === "string") {
      try { payload = JSON.parse(payload); } catch (e) {}
    }
    const newCh = {
      id: mockDb.mockChroniques.length + 1,
      reference: (payload.titre || "chronique").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      titre: payload.titre || "Nouvelle chronique",
      title: payload.titre || "Nouvelle chronique",
      description: payload.description || "",
      cover_image: payload.cover_image || payload.image || "",
      chapters_count: 0,
      status: payload.status || "En cours",
      views_count: 0,
      user: { fullname: "Awa Diop" },
      created_at: new Date().toISOString()
    };
    mockDb.mockChroniques.unshift(newCh);
    data = { success: true, message: "Chronique créée avec succès.", data: newCh };
  }
  else if (normalizedPath.startsWith("/blogger/add-chapter/")) {
    const id = normalizedPath.split("/")[3];
    const body = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data;
    const ch = mockDb.mockChroniques.find(c => String(c.id) === String(id) || c.reference === id);
    if (ch) {
      ch.chapters_count = (ch.chapters_count || 0) + 1;
      if (!mockDb.mockChapters[ch.reference]) {
        mockDb.mockChapters[ch.reference] = [];
      }
      const newCap = {
        id: Math.random(),
        numero: ch.chapters_count,
        title: body.title || `Chapitre ${ch.chapters_count}`,
        content: body.content || ""
      };
      mockDb.mockChapters[ch.reference].push(newCap);
    }
    data = { success: true, message: "Chapitre ajouté avec succès." };
  }
  else if (normalizedPath.startsWith("/blogger/delete-article/") || normalizedPath.startsWith("/delete-article/")) {
    const id = Number(normalizedPath.split("/")[3] || normalizedPath.split("/")[2]);
    const idx = mockDb.mockArticles.findIndex(a => a.id === id);
    if (idx !== -1) {
      mockDb.mockArticles.splice(idx, 1);
    }
    data = { success: true, message: "Article supprimé." };
  }
  else if (normalizedPath === "/blogger/stats" && method === "get") {
    data = mockDb.getBloggerStats();
  }
  else if (normalizedPath === "/blogger/profile" && method === "put") {
    const body = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data;
    mockDb.mockCurrentUser.fullname = body.nom_de_plume || mockDb.mockCurrentUser.fullname;
    mockDb.mockCurrentUser.bio = body.bio || "";
    data = { success: true, message: "Profil blogger mis à jour.", data: mockDb.mockCurrentUser };
  }
  else if (normalizedPath === "/article-categories" && method === "get") {
    data = { success: true, data: mockDb.mockCategories };
  }
  else {
    // Default fallback mock
    data = { success: true, message: "Mock match global par défaut.", data: [] };
  }

  // Simulate server response latency (300ms)
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (status >= 200 && status < 300) {
    return {
      data,
      status,
      statusText: "OK",
      headers: {},
      config,
      request: {},
    };
  } else {
    const error = new Error("Request failed with status code " + status);
    error.response = {
      data,
      status,
      statusText: "Error",
      headers: {},
      config,
      request: {},
    };
    throw error;
  }
};

export default apiClient;
