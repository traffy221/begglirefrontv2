import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/client";
import { useArticles } from "./useQueries";

const HISTORY_KEY = "begglire_search_history";
const MAX_HISTORY = 8;

export default function useSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [history, setHistory] = useState([]);

  // Load history on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        try {
          setHistory(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse search history", e);
        }
      }
    }
  }, []);

  // Debounce logic
  useEffect(() => {
    if (!query.trim()) {
      setDebouncedQuery("");
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      setIsDebouncing(false);
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  // Fetch books matching query
  const { data: booksData, isLoading: isBooksLoading } = useQuery({
    queryKey: ["searchBooks", debouncedQuery],
    queryFn: async () => {
      const response = await apiClient.get(`/search-book?query=${encodeURIComponent(debouncedQuery)}`);
      return response.data;
    },
    staleTime: 30000, // 30s
    enabled: debouncedQuery.trim().length >= 2,
  });

  // Fetch all articles to filter client-side
  const { data: articlesData, isLoading: isArticlesLoading } = useArticles();

  // Grouped results calculations
  const groupedResults = useMemo(() => {
    const defaultGrouped = { livres: [], auteurs: [], categories: [], articles: [] };
    if (debouncedQuery.trim().length < 2) return defaultGrouped;

    const livres = booksData?.data || [];

    // Extract unique authors (max 3 suggestions)
    const uniqueAuthors = [...new Set(livres.map(l => l.auteur).filter(Boolean))];
    const auteurs = uniqueAuthors.slice(0, 3).map(name => {
      const count = livres.filter(l => l.auteur === name).length;
      return { nom: name, count };
    });

    // Extract unique categories (max 3 suggestions)
    const categoryMap = new Map();
    livres.forEach(l => {
      const catName = l.category?.name || l.categorie;
      const catId = l.category?.id || l.category_id || catName;
      if (catName) {
        if (!categoryMap.has(catName)) {
          categoryMap.set(catName, { id: catId, name: catName, count: 0 });
        }
        categoryMap.get(catName).count += 1;
      }
    });
    const categories = Array.from(categoryMap.values()).slice(0, 3);

    // Extract matching articles (max 3 suggestions)
    const rawArticles = articlesData?.data || [];
    const lowerQuery = debouncedQuery.toLowerCase();
    const articles = rawArticles
      .filter(art => {
        const titleMatch = (art.title || art.titre || "").toLowerCase().includes(lowerQuery);
        const contentMatch = (art.content || art.contenu || "").toLowerCase().includes(lowerQuery);
        return titleMatch || contentMatch;
      })
      .slice(0, 3)
      .map(art => ({
        id: art.id,
        titre: art.title || art.titre || "Article",
        content: art.content || art.contenu || "",
        type: art.type || "article",
        image: art.image || null
      }));

    return {
      livres,
      auteurs,
      categories,
      articles
    };
  }, [booksData, articlesData, debouncedQuery]);

  // History action helpers
  const addToHistory = useCallback((q) => {
    if (!q || !q.trim()) return;
    const cleanQ = q.trim();
    setHistory(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== cleanQ.toLowerCase());
      const updated = [cleanQ, ...filtered].slice(0, MAX_HISTORY);
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const removeFromHistory = useCallback((q) => {
    setHistory(prev => {
      const updated = prev.filter(item => item !== q);
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem(HISTORY_KEY);
    }
  }, []);

  // Total counts across all segments
  const totalCount = useMemo(() => {
    return (
      groupedResults.livres.length +
      groupedResults.auteurs.length +
      groupedResults.categories.length +
      groupedResults.articles.length
    );
  }, [groupedResults]);

  const hasResults = totalCount > 0;

  // Determine overall loading status
  const isLoading = isDebouncing || (debouncedQuery.trim().length >= 2 && isBooksLoading);

  return {
    query,
    setQuery,
    results: groupedResults,
    isLoading,
    hasResults,
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    totalCount
  };
}
