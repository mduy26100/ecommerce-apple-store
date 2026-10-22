import { api } from "@core/api/axios.config";
import type { Product, Category, ProductCardItem } from "../types/catalog.types";

export const catalogApi = {
  getCategories: async (): Promise<Category[]> => {
    try {
      const data = await api.get<Category[]>("/api/categories");
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    } catch {
      return [];
    }
  },

  getProductCards: async (categoryId?: number, limit: number = 100): Promise<ProductCardItem[]> => {
    try {
      const url = categoryId
        ? `/api/products/cards?categoryId=${categoryId}&limit=${limit}`
        : `/api/products/cards?limit=${limit}`;
      const data = await api.get<any>(url);
      const items = Array.isArray(data) ? data : (data?.items || []);
      return items.map((item: any) => ({
        id: item.id,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        category: item.categoryName,
        name: item.name,
        slug: item.slug,
        price: item.price || 0,
        thumbnail: item.imageUrl || "",
        imageUrl: item.imageUrl || "",
        chipName: item.chipName || "Apple Silicon",
        badgeText: item.badgeText || "SẴN HÀNG",
        shortDescription: item.shortDescription || "",
        description: item.shortDescription || "",
        isNew: true,
        isHot: item.badgeText === "BÁN CHẠY",
        tag: item.badgeText || "SẴN HÀNG",
      }));
    } catch {
      return [];
    }
  },

  getProducts: async (categoryId?: number, limit: number = 100): Promise<Product[]> => {
    return catalogApi.getProductCards(categoryId, limit);
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    return catalogApi.getProductCards(undefined, 100);
  },
};

