export interface ProductCardItem {
  id: number;
  categoryId: number;
  categoryName?: string;
  name: string;
  slug: string;
  chipName?: string;
  badgeText?: string;
  shortDescription?: string;
  price: number;
  imageUrl?: string;
}

export interface Product extends ProductCardItem {
  originalPrice?: number;
  thumbnail?: string;
  category?: string;
  isNew?: boolean;
  isHot?: boolean;
  tag?: string;
  description?: string;
  variantImages?: string[];
  primaryImageUrl?: string;
  minPrice?: number;
  maxPrice?: number;
  variantsCount?: number;
}

export interface Category {
  id: string | number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  icon?: string;
  productCount?: number;
  description?: string;
}

export interface ProductCardPagedParams {
  category?: string;
  categorySlug?: string;
  categoryId?: number;
  search?: string;
  sortBy?: string;
  minPrice?: number;
  maxPrice?: number;
  pageNumber?: number;
  pageSize?: number;
  limit?: number;
}

export interface ProductCardPagedResponse {
  items: ProductCardItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  itemCount: number;
}

export interface CategoryProductShowcase {
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  categoryDescription?: string;
  products: ProductCardItem[];
}

