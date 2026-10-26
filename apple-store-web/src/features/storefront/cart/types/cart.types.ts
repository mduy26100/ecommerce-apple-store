export interface CartItemAttribute {
  optionName: string;
  value: string;
  colorHexCode?: string | null;
}

export interface CartItem {
  id: number;
  cartId: number;
  productVariantId: number;
  productId: number;
  productName: string;
  productSlug: string;
  sku: string;
  variantName?: string | null;
  imageUrl?: string | null;
  unitPrice: number;
  originalPrice: number;
  compareAtPrice?: number | null;
  quantity: number;
  quantityInStock: number;
  isSelected: boolean;
  isActive: boolean;
  isAvailable: boolean;
  lineTotal: number;
  attributes: CartItemAttribute[];
}

export interface Cart {
  id: number;
  userId?: number | null;
  guestId?: string | null;
  totalItems: number;
  selectedItemsCount: number;
  subtotal: number;
  items: CartItem[];
}

export interface AddToCartPayload {
  productVariantId: number;
  quantity: number;
  guestId?: string | null;
}

export interface UpdateQuantityPayload {
  productVariantId: number;
  quantity: number;
  guestId?: string | null;
}

export interface UpdateSelectionPayload {
  productVariantId: number;
  isSelected: boolean;
  guestId?: string | null;
}

export interface MergeCartPayload {
  guestId: string;
}

export interface ChangeItemVariantPayload {
  cartItemId: number;
  newProductVariantId: number;
  guestId?: string | null;
}

export interface ProductOptionValueSelector {
  id: number;
  value: string;
  colorHexCode?: string | null;
  displayOrder: number;
}

export interface ProductOptionSelector {
  id: number;
  name: string;
  displayOrder: number;
  values: ProductOptionValueSelector[];
}

export interface ProductVariantSelector {
  id: number;
  sku: string;
  variantName?: string | null;
  price: number;
  compareAtPrice?: number | null;
  quantityInStock: number;
  isActive: boolean;
  imageUrl?: string | null;
  optionValueIds: number[];
}

export interface ProductVariantOptionsResponse {
  productId: number;
  productName: string;
  productSlug: string;
  primaryImageUrl?: string | null;
  options: ProductOptionSelector[];
  variants: ProductVariantSelector[];
}
