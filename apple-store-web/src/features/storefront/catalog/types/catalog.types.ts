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
