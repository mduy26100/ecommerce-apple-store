export interface ProductSearchResult {
  id: number;
  name: string;
  slug: string;
  categoryName: string;
  chipName?: string;
  price: number;
  compareAtPrice?: number;
  imageUrl?: string | null;
}

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

export interface GalleryImageItem {
  id: string | number;
  imageUrl: string;
  altText?: string;
  colorId?: number;
  colorName?: string;
}

export interface VariantImageItem {
  id: number;
  imageUrl: string;
  altText?: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface ProductSpecificationItem {
  id: number;
  groupId?: number;
  name: string;
  value: string;
  groupName: string;
  displayOrder: number;
  unit?: string | null;
}

export interface ProductSpecificationGroupItem {
  id: number;
  productId: number;
  name: string;
  displayOrder: number;
  specifications: ProductSpecificationItem[];
}

export interface ProductOptionValueItem {
  id: number;
  optionId: number;
  value: string;
  colorHexCode?: string | null;
  displayOrder: number;
  hasVariants?: boolean;
  inStock?: boolean;
}

export interface ProductOptionItem {
  id: number;
  productId: number;
  name: string;
  displayOrder: number;
  values: ProductOptionValueItem[];
}

export interface ProductVariantValueItem {
  optionId: number;
  optionName: string;
  optionValueId: number;
  value: string;
  colorHexCode?: string | null;
}

export interface ProductVariantDetail {
  id: number;
  sku: string;
  variantName?: string | null;
  price: number;
  compareAtPrice?: number | null;
  quantityInStock?: number;
  stockQuantity: number;
  primaryImageUrl?: string;
  isActive?: boolean;
  images: VariantImageItem[];
  variantValues: ProductVariantValueItem[];
  optionValueIds: number[];
  colorId?: number;
  colorName?: string;
  colorHexCode?: string;
  storageOptionId?: number;
  storageOptionCapacity?: string;
}

export interface ProductImageItem {
  id: number;
  productId: number;
  optionValueId?: number | null;
  optionValueName?: string | null;
  colorHexCode?: string | null;
  imageUrl: string;
  altText?: string | null;
  displayOrder: number;
  isPrimary: boolean;
}

export interface ProductDetailResponse {
  id: number;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  name: string;
  slug: string;
  modelCode?: string;
  warrantyMonths: number;
  description?: string;
  images: ProductImageItem[];
  options: ProductOptionItem[];
  variants: ProductVariantDetail[];
  specifications: ProductSpecificationItem[];
  specificationGroups?: ProductSpecificationGroupItem[];
}
