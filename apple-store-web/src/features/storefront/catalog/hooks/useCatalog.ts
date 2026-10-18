import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "../api/catalog.api";

export const CATALOG_QUERY_KEYS = {
  CATEGORIES: ["catalog", "categories"] as const,
  FEATURED_PRODUCTS: ["catalog", "featured-products"] as const,
};

export const useCategories = () => {
  return useQuery({
    queryKey: CATALOG_QUERY_KEYS.CATEGORIES,
    queryFn: () => catalogApi.getCategories(),
    staleTime: Infinity,
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: CATALOG_QUERY_KEYS.FEATURED_PRODUCTS,
    queryFn: () => catalogApi.getFeaturedProducts(),
    staleTime: 5 * 60 * 1000,
  });
};
