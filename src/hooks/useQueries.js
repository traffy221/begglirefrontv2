import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/client";

// Cache Durations
const CACHE_LIST_TIME = 5 * 60 * 1000;    // 5 minutes
const CACHE_DETAIL_TIME = 10 * 60 * 1000; // 10 minutes

/* ==========================================================================
   BOOKS & CATALOG HOOKS
   ========================================================================== */

/**
 * Fetch books for sale in a specific category (e.g. 'recent', 'selection', etc.)
 */
export const useBooks = (category) => {
  return useQuery({
    queryKey: ["books", category],
    queryFn: async () => {
      const response = await apiClient.get(`/vente-livres/${category}`);
      return response.data;
    },
    staleTime: CACHE_LIST_TIME,
    enabled: !!category,
  });
};

/**
 * Fetch detailed information for a single book by ID
 */
export const useBookDetail = (id) => {
  return useQuery({
    queryKey: ["bookDetail", id],
    queryFn: async () => {
      const response = await apiClient.get(`/livre-en-vente/${id}`);
      return response.data;
    },
    staleTime: CACHE_DETAIL_TIME,
    enabled: id !== undefined && id !== null,
  });
};

/**
 * Fetch related books for a given book ID
 */
export const useRelatedBooks = (id) => {
  return useQuery({
    queryKey: ["relatedBooks", id],
    queryFn: async () => {
      const response = await apiClient.get(`/related-book/${id}`);
      return response.data;
    },
    staleTime: CACHE_DETAIL_TIME,
    enabled: id !== undefined && id !== null,
  });
};

/**
 * Fetch a "book of the moment" category (e.g. choice of the week, featured, etc.)
 */
export const useBookMoment = (category) => {
  return useQuery({
    queryKey: ["bookMoment", category],
    queryFn: async () => {
      const response = await apiClient.get(`/get-book-moment/${category}`);
      return response.data;
    },
    staleTime: CACHE_LIST_TIME,
    enabled: !!category,
  });
};

/**
 * Search books using a search query
 */
export const useSearch = (query) => {
  return useQuery({
    queryKey: ["searchBooks", query],
    queryFn: async () => {
      const response = await apiClient.get(`/search-book?query=${encodeURIComponent(query)}`);
      return response.data;
    },
    staleTime: CACHE_LIST_TIME,
    enabled: query !== undefined && query !== null && query.trim() !== "",
  });
};

/**
 * Fetch all book categories
 */
export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await apiClient.get("/category/all");
      return response.data;
    },
    staleTime: CACHE_LIST_TIME,
  });
};

/**
 * Fetch books belonging to a specific category ID
 */
export const useBooksByCategory = (id) => {
  return useQuery({
    queryKey: ["booksByCategory", id],
    queryFn: async () => {
      const response = await apiClient.get(`/vente-livres-category/${id}`);
      return response.data;
    },
    staleTime: CACHE_LIST_TIME,
    enabled: id !== undefined && id !== null,
  });
};

/* ==========================================================================
   SCHOOL SUPPLIES HOOKS
   ========================================================================== */

/**
 * Fetch all school supplies
 */
export const useSupplies = () => {
  return useQuery({
    queryKey: ["supplies"],
    queryFn: async () => {
      const response = await apiClient.get("/school-supplies");
      return response.data;
    },
    staleTime: CACHE_LIST_TIME,
  });
};

/**
 * Fetch school supply categories
 */
export const useSupplyCategories = () => {
  return useQuery({
    queryKey: ["supplyCategories"],
    queryFn: async () => {
      const response = await apiClient.get("/school-supply-categories");
      return response.data;
    },
    staleTime: CACHE_LIST_TIME,
  });
};

/**
 * Fetch detailed info for a single school supply
 */
export const useSupplyDetail = (id) => {
  return useQuery({
    queryKey: ["supplyDetail", id],
    queryFn: async () => {
      const response = await apiClient.get(`/school-supply/${id}`);
      return response.data;
    },
    staleTime: CACHE_DETAIL_TIME,
    enabled: id !== undefined && id !== null,
  });
};

/* ==========================================================================
   COMMUNITY & BLOG HOOKS
   ========================================================================== */

/**
 * Fetch community blog articles
 */
export const useArticles = () => {
  return useQuery({
    queryKey: ["articles"],
    queryFn: async () => {
      const response = await apiClient.get("/articles");
      return response.data;
    },
    staleTime: CACHE_LIST_TIME,
  });
};

/**
 * Read a single article by type and ID
 */
export const useArticle = (type, id) => {
  return useQuery({
    queryKey: ["articleDetail", type, id],
    queryFn: async () => {
      const response = await apiClient.get(`/read-article/${type}/${id}`);
      return response.data;
    },
    staleTime: CACHE_DETAIL_TIME,
    enabled: !!type && id !== undefined && id !== null,
  });
};

/**
 * Fetch community chronicles
 */
export const useChroniques = () => {
  return useQuery({
    queryKey: ["chroniques"],
    queryFn: async () => {
      const response = await apiClient.get("/chroniques");
      return response.data;
    },
    staleTime: CACHE_LIST_TIME,
  });
};

/**
 * Read a specific chronicle by reference
 */
export const useChronique = (reference) => {
  return useQuery({
    queryKey: ["chroniqueDetail", reference],
    queryFn: async () => {
      const response = await apiClient.get(`/chronique/${reference}`);
      return response.data;
    },
    staleTime: CACHE_DETAIL_TIME,
    enabled: !!reference,
  });
};

/**
 * Get chapters of a chronicle by reference
 */
export const useChapters = (reference) => {
  return useQuery({
    queryKey: ["chroniqueChapters", reference],
    queryFn: async () => {
      const response = await apiClient.get(`/chroniques/get-chapters/${reference}`);
      return response.data;
    },
    staleTime: CACHE_DETAIL_TIME,
    enabled: !!reference,
  });
};

/* ==========================================================================
   EDITORIAL & AUTHOR HOOKS
   ========================================================================== */

/**
 * Fetch the featured author of the week
 */
export const useAuteurSemaine = () => {
  return useQuery({
    queryKey: ["auteurSemaine"],
    queryFn: async () => {
      const response = await apiClient.get("/auteurs-semaine/current");
      return response.data;
    },
    staleTime: CACHE_DETAIL_TIME,
  });
};
