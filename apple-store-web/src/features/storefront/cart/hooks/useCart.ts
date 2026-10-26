import { useQuery, useMutation } from "@tanstack/react-query";
import { message } from "antd";
import { queryClient } from "@core/api/queryClient";
import { useAuthStore } from "@features/auth";
import { cartApi } from "../api/cart.api";
import { CART_QUERY_KEYS } from "../constants/cart.constants";
import { getGuestId, getOrCreateGuestId, clearGuestId } from "../utils/guest";
import type { AddToCartPayload } from "../types/cart.types";

export const useCart = () => {
  const user = useAuthStore((state) => state.user);
  const guestId = !user ? getGuestId() : null;

  return useQuery({
    queryKey: [...CART_QUERY_KEYS.CART, user?.id || guestId],
    queryFn: () => cartApi.getCart(guestId),
    staleTime: 0,
  });
};

export const useAddToCart = () => {
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (payload: Omit<AddToCartPayload, "guestId"> & { guestId?: string | null }) => {
      const resolvedGuestId = !user ? payload.guestId || getOrCreateGuestId() : null;
      await cartApi.addToCart({
        ...payload,
        guestId: resolvedGuestId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.CART });
      message.success("Đã thêm sản phẩm vào giỏ hàng!");
    },
    onError: (error: any) => {
      const errorMsg =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại!";
      message.error(errorMsg);
    },
  });
};

export const useUpdateCartQuantity = () => {
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (payload: { productVariantId: number; quantity: number }) => {
      const guestId = !user ? getGuestId() : null;
      await cartApi.updateQuantity({
        ...payload,
        guestId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.CART });
    },
    onError: (error: any) => {
      const errorMsg =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Không thể cập nhật số lượng. Vui lòng thử lại!";
      message.error(errorMsg);
    },
  });
};

export const useUpdateCartSelection = () => {
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (payload: { productVariantId: number; isSelected: boolean }) => {
      const guestId = !user ? getGuestId() : null;
      await cartApi.updateSelection({
        ...payload,
        guestId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.CART });
    },
    onError: (error: any) => {
      const errorMsg =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Không thể cập nhật trạng thái chọn sản phẩm!";
      message.error(errorMsg);
    },
  });
};

export const useRemoveCartItem = () => {
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (productVariantId: number) => {
      const guestId = !user ? getGuestId() : null;
      await cartApi.removeItem(productVariantId, guestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.CART });
      message.success("Đã xóa sản phẩm khỏi giỏ hàng!");
    },
    onError: (error: any) => {
      const errorMsg =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Không thể xóa sản phẩm khỏi giỏ hàng!";
      message.error(errorMsg);
    },
  });
};

export const useClearCart = () => {
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async () => {
      const guestId = !user ? getGuestId() : null;
      await cartApi.clearCart(guestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.CART });
      message.success("Đã dọn sạch giỏ hàng!");
    },
    onError: (error: any) => {
      const errorMsg =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Không thể làm trống giỏ hàng!";
      message.error(errorMsg);
    },
  });
};

export const useMergeCart = () => {
  return useMutation({
    mutationFn: async (guestId: string) => {
      await cartApi.mergeCart({ guestId });
    },
    onSuccess: () => {
      clearGuestId();
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.CART });
    },
    onError: () => {
      clearGuestId();
    },
  });
};

export const useProductOptions = (productId?: number) => {
  return useQuery({
    queryKey: ["product-options-matrix", productId],
    queryFn: () => cartApi.getProductOptions(productId!),
    enabled: Boolean(productId && productId > 0),
    staleTime: 60000,
  });
};

export const useChangeItemVariant = () => {
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (payload: { cartItemId: number; newProductVariantId: number }) => {
      const guestId = !user ? getGuestId() : null;
      await cartApi.changeItemVariant({
        ...payload,
        guestId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.CART });
      message.success("Đã thay đổi phiên bản sản phẩm trong giỏ hàng!");
    },
    onError: (error: any) => {
      const errorMsg =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Không thể đổi phân loại sản phẩm. Vui lòng thử lại!";
      message.error(errorMsg);
    },
  });
};
