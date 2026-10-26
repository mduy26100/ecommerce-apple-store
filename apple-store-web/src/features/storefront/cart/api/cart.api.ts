import { api } from "@core/api/axios.config";
import { CART_ENDPOINTS } from "../constants/cart.endpoints";
import type {
  Cart,
  AddToCartPayload,
  UpdateQuantityPayload,
  UpdateSelectionPayload,
  MergeCartPayload,
  ChangeItemVariantPayload,
  ProductVariantOptionsResponse,
} from "../types/cart.types";

export const cartApi = {
  getCart: async (guestId?: string | null): Promise<Cart> => {
    const params = guestId ? { guestId } : {};
    const response = await api.get<Cart>(CART_ENDPOINTS.GET_CART, { params });
    return response;
  },

  addToCart: async (payload: AddToCartPayload): Promise<void> => {
    await api.post(CART_ENDPOINTS.ADD_ITEM, payload);
  },

  updateQuantity: async (payload: UpdateQuantityPayload): Promise<void> => {
    await api.put(CART_ENDPOINTS.UPDATE_QUANTITY, payload);
  },

  updateSelection: async (payload: UpdateSelectionPayload): Promise<void> => {
    await api.put(CART_ENDPOINTS.UPDATE_SELECTION, payload);
  },

  changeItemVariant: async (payload: ChangeItemVariantPayload): Promise<void> => {
    await api.put(CART_ENDPOINTS.CHANGE_VARIANT, payload);
  },

  getProductOptions: async (productId: number): Promise<ProductVariantOptionsResponse> => {
    const response = await api.get<ProductVariantOptionsResponse>(
      CART_ENDPOINTS.GET_PRODUCT_OPTIONS(productId)
    );
    return response;
  },

  removeItem: async (productVariantId: number, guestId?: string | null): Promise<void> => {
    const params = guestId ? { guestId } : {};
    await api.delete(CART_ENDPOINTS.REMOVE_ITEM(productVariantId), { params });
  },

  clearCart: async (guestId?: string | null): Promise<void> => {
    const params = guestId ? { guestId } : {};
    await api.delete(CART_ENDPOINTS.CLEAR_CART, { params });
  },

  mergeCart: async (payload: MergeCartPayload): Promise<void> => {
    await api.post(CART_ENDPOINTS.MERGE_CART, payload);
  },
};
