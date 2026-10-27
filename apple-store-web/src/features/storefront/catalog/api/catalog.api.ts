import { api } from "@core/api/axios.config";
import type {
  Product,
  Category,
  ProductCardItem,
  ProductCardPagedParams,
  ProductCardPagedResponse,
  CategoryProductShowcase,
  ProductDetailResponse,
  ProductSearchResult,
} from "../types/catalog.types";

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

  getHomeShowcase: async (countPerCategory: number = 4): Promise<CategoryProductShowcase[]> => {
    try {
      const data = await api.get<CategoryProductShowcase[]>(
        `/api/products/showcase?countPerCategory=${countPerCategory}`
      );
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    } catch {
      return [];
    }
  },

  getProductCardsPaged: async (params?: ProductCardPagedParams): Promise<ProductCardPagedResponse> => {
    try {
      const queryParams: Record<string, any> = {
        pageNumber: params?.pageNumber || 1,
        pageSize: params?.pageSize || 20,
      };

      if (params?.categoryId) queryParams.categoryId = params.categoryId;
      if (params?.categorySlug) queryParams.categorySlug = params.categorySlug;
      if (params?.category) queryParams.categorySlug = params.category;
      if (params?.search) queryParams.search = params.search;
      if (params?.sortBy) queryParams.sortBy = params.sortBy;
      if (params?.minPrice) queryParams.minPrice = params.minPrice;
      if (params?.maxPrice) queryParams.maxPrice = params.maxPrice;
      if (params?.limit) queryParams.limit = params.limit;

      const data = await api.get<any>("/api/products/cards", { params: queryParams });
      const rawItems = Array.isArray(data) ? data : (data?.items || []);
      const meta = data?.meta?.cursorPagedResult;

      const items: ProductCardItem[] = rawItems.map((item: any) => ({
        id: item.id,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        name: item.name,
        slug: item.slug,
        chipName: item.chipName || "Apple Silicon",
        badgeText: item.badgeText || "SẴN HÀNG",
        shortDescription: item.shortDescription || "",
        price: item.price || 0,
        imageUrl: item.imageUrl || "",
      }));

      const totalCount = meta?.totalCount ?? items.length;
      const pageSize = meta?.pageSize || params?.pageSize || 20;

      return {
        items,
        pageNumber: meta?.pageNumber || params?.pageNumber || 1,
        pageSize,
        totalCount,
        totalPages: meta?.totalPages || Math.max(1, Math.ceil(totalCount / pageSize)),
        hasPreviousPage: meta?.hasPreviousPage ?? ((params?.pageNumber || 1) > 1),
        hasNextPage: meta?.hasNextPage ?? false,
        itemCount: meta?.itemCount ?? items.length,
      };
    } catch {
      return {
        items: [],
        pageNumber: 1,
        pageSize: 20,
        totalCount: 0,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
        itemCount: 0,
      };
    }
  },

  getProductBySlug: async (slug: string): Promise<ProductDetailResponse | null> => {
    try {
      const data = await api.get<ProductDetailResponse>(`/api/products/${slug}`);
      return data ?? null;
    } catch {
      return null;
    }
  },

  getRandomProducts: async (count: number = 12, excludeId?: number): Promise<ProductCardItem[]> => {
    try {
      const data = await api.get<ProductCardItem[]>("/api/products/random", {
        params: { count, excludeId },
      });
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  searchProducts: async (query: string, limit: number = 8): Promise<ProductSearchResult[]> => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 3) {
      return [];
    }
    try {
      const data = await api.get<ProductSearchResult[]>("/api/products/search", {
        params: { query: trimmed, limit },
      });
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },
};

