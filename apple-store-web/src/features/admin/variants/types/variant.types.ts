export interface ProductVariantValueItem {
  optionId: number;
  optionName: string;
  optionValueId: number;
  value: string;
  colorHexCode?: string | null;
}

export interface ProductOptionValueItem {
  id: number;
  optionId: number;
  value: string;
  colorHexCode?: string | null;
  displayOrder: number;
}

export interface ProductOptionItem {
  id: number;
  productId: number;
  name: string;
  displayOrder: number;
  values: ProductOptionValueItem[];
}

export interface ProductVariantItem {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  variantName?: string | null;
  price: number;
  compareAtPrice?: number | null;
  quantityInStock: number;
  rowVersion: string;
  isActive: boolean;
  primaryImageUrl?: string | null;
  variantValues?: ProductVariantValueItem[];
  optionValueIds?: number[];
  colorId?: number | null;
  colorName?: string | null;
  colorHexCode?: string | null;
  storageOptionId?: number | null;
  storageCapacity?: string | null;
  createdOn: string;
  lastModifiedOn?: string | null;
}

export interface CreateVariantPayload {
  productId: number;
  sku: string;
  variantName?: string;
  optionValueIds?: number[];
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
  optionValueIds?: number[];
  colorId?: number;
  storageOptionId?: number;
  price: number;
  compareAtPrice?: number;
  quantityInStock: number;
  rowVersion?: string;
  isActive?: boolean;
}
