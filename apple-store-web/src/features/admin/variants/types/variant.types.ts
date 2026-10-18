export interface ProductVariantItem {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  variantName?: string | null;
  colorId?: number | null;
  colorName?: string | null;
  colorHexCode?: string | null;
  storageOptionId?: number | null;
  storageCapacity?: string | null;
  price: number;
  compareAtPrice?: number | null;
  quantityInStock: number;
  rowVersion: string;
  isActive: boolean;
  primaryImageUrl?: string | null;
  createdOn: string;
  lastModifiedOn?: string | null;
}

export interface CreateVariantPayload {
  productId: number;
  sku: string;
  variantName?: string;
  colorId?: number;
  storageOptionId?: number;
  price: number;
  compareAtPrice?: number;
  quantityInStock: number;
  isActive?: boolean;
}

export interface UpdateVariantPayload {
  sku: string;
  variantName?: string;
  colorId?: number;
  storageOptionId?: number;
  price: number;
  compareAtPrice?: number;
  quantityInStock: number;
  rowVersion?: string;
  isActive?: boolean;
}
