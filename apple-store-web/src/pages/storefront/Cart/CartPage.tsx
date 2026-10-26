import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Checkbox, Button, Popconfirm, Spin, message, Alert } from "antd";
import {
  DeleteOutlined,
  WarningOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import {
  useCart,
  useUpdateCartQuantity,
  useUpdateCartSelection,
  useRemoveCartItem,
  useClearCart,
  CartItemRow,
  CartSummary,
  EmptyCart,
  ChangeVariantModal,
  type CartItem,
} from "@features/storefront/cart";

export const CartPage = () => {
  const { data: cart, isLoading } = useCart();
  const { mutate: updateQuantity, isPending: isUpdatingQty } = useUpdateCartQuantity();
  const { mutate: updateSelection, isPending: isUpdatingSelection } = useUpdateCartSelection();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveCartItem();
  const { mutate: clearCart, isPending: isClearing } = useClearCart();

  const [editingItem, setEditingItem] = useState<CartItem | null>(null);

  const isBusy = isUpdatingQty || isUpdatingSelection || isRemoving || isClearing;

  const { availableItems, unavailableItems, allAvailableSelected, availableItemsQuantity } = useMemo(() => {
    const items = cart?.items || [];
    const available = items.filter((i) => i.isAvailable && i.quantityInStock > 0);
    const unavailable = items.filter((i) => !i.isAvailable || i.quantityInStock <= 0);
    const allSelected = available.length > 0 && available.every((i) => i.isSelected);
    const availableQty = available.reduce((acc, it) => acc + it.quantity, 0);

    return {
      availableItems: available,
      unavailableItems: unavailable,
      allAvailableSelected: allSelected,
      availableItemsQuantity: availableQty,
    };
  }, [cart?.items]);

  const handleSelectAll = (checked: boolean) => {
    availableItems.forEach((item) => {
      if (item.isSelected !== checked) {
        updateSelection({
          productVariantId: item.productVariantId,
          isSelected: checked,
        });
      }
    });
  };

  const handleCheckout = () => {
    message.info("Chức năng tạo đơn hàng & Thanh toán sẽ được kết nối ở bước hoàn thiện tiếp theo!");
  };

  if (isLoading) {
    return (
      <div className="min-h-120 flex flex-col items-center justify-center gap-3">
        <Spin size="large" />
        <span className="text-sm text-slate-500 font-medium">Đang tải giỏ hàng của bạn...</span>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <EmptyCart />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-6 sm:mb-8 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/" className="hover:text-blue-600 transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">Giỏ hàng</span>
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1
            data-testid="cart-page-title"
            className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5"
          >
            <ShoppingOutlined className="text-blue-600" />
            <span>Giỏ hàng của bạn</span>
            <span className="text-base sm:text-lg font-bold text-slate-400">
              ({availableItemsQuantity} sản phẩm)
            </span>
          </h1>

          <Popconfirm
            title="Dọn sạch giỏ hàng"
            description="Bạn có chắc chắn muốn xóa toàn bộ sản phẩm khỏi giỏ hàng?"
            okText="Xóa tất cả"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => clearCart()}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              disabled={isBusy}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 h-8 px-2.5 rounded-lg cursor-pointer"
            >
              Xóa tất cả
            </Button>
          </Popconfirm>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          {availableItems.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 flex items-center justify-between shadow-2xs">
              <Checkbox
                checked={allAvailableSelected}
                disabled={isBusy}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="font-bold text-slate-800 text-xs sm:text-sm"
              >
                Chọn tất cả ({availableItems.length} sản phẩm sẵn có)
              </Checkbox>

              <span className="text-xs text-slate-500 hidden sm:inline">
                Đã chọn: <strong className="text-blue-600 font-bold">{cart.selectedItemsCount}</strong> món
              </span>
            </div>
          )}

          <div className="space-y-3.5">
            {availableItems.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                isUpdating={isBusy}
                onQuantityChange={(variantId, nextQty) =>
                  updateQuantity({ productVariantId: variantId, quantity: nextQty })
                }
                onSelectionChange={(variantId, nextSelected) =>
                  updateSelection({ productVariantId: variantId, isSelected: nextSelected })
                }
                onRemove={(variantId) => removeItem(variantId)}
                onChangeVariant={(target) => setEditingItem(target)}
              />
            ))}
          </div>

          {unavailableItems.length > 0 && (
            <div className="mt-10 sm:mt-12 pt-8 sm:pt-10 border-t-2 border-slate-200/90 space-y-6">
              <Alert
                type="warning"
                showIcon
                icon={<WarningOutlined className="text-amber-500 text-lg mt-0.5" />}
                message={
                  <span className="font-bold text-slate-800 text-sm sm:text-base">
                    Sản phẩm tạm hết hàng hoặc ngừng kinh doanh ({unavailableItems.length})
                  </span>
                }
                description={
                  <span className="text-xs sm:text-sm text-slate-600 leading-relaxed block mt-1">
                    Các sản phẩm dưới đây hiện không thể thanh toán do hết hàng hoặc tạm ngừng hoạt động. Bạn có thể đổi sang phân loại khác còn hàng hoặc xóa khỏi giỏ.
                  </span>
                }
                className="rounded-2xl border-amber-200/90 bg-amber-50/80 p-4 sm:p-5 shadow-2xs mb-4! sm:mb-5!"
              />

              <div className="space-y-4">
                {unavailableItems.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    isUpdating={isBusy}
                    onQuantityChange={() => { }}
                    onSelectionChange={() => { }}
                    onRemove={(variantId) => removeItem(variantId)}
                    onChangeVariant={(target) => setEditingItem(target)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4">
          <CartSummary cart={cart} onCheckout={handleCheckout} isLoading={isBusy} />
        </div>
      </div>

      <ChangeVariantModal
        open={Boolean(editingItem)}
        item={editingItem}
        onClose={() => setEditingItem(null)}
      />
    </div>
  );
};

export default CartPage;
