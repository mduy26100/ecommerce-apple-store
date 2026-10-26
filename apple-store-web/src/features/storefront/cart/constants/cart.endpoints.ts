export const CART_ENDPOINTS = {
  GET_CART: "/api/cart",
  ADD_ITEM: "/api/cart/items",
  UPDATE_QUANTITY: "/api/cart/items/quantity",
  UPDATE_SELECTION: "/api/cart/items/selection",
  REMOVE_ITEM: (variantId: number) => `/api/cart/items/${variantId}`,
  CLEAR_CART: "/api/cart",
  MERGE_CART: "/api/cart/merge",
  CHANGE_VARIANT: "/api/cart/items/variant",
  GET_PRODUCT_OPTIONS: (productId: number) => `/api/products/${productId}/options-matrix`,
} as const;
