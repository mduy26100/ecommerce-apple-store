using Application.Common.Interfaces.Persistence;
using Application.Features.Catalog.ProductVariants.Specifications;
using Application.Features.Sales.Carts.DTOs;
using Application.Features.Sales.Carts.Specifications;
using Domain.Entities.Catalog;
using Domain.Entities.Sales;
using Domain.Exceptions;

namespace Application.Features.Sales.Carts.Services
{
    public class CartService : ICartService
    {
        private readonly IRepository<Cart> _cartRepository;
        private readonly IRepository<ProductVariant> _variantRepository;

        public CartService(
            IRepository<Cart> cartRepository,
            IRepository<ProductVariant> variantRepository)
        {
            _cartRepository = cartRepository;
            _variantRepository = variantRepository;
        }

        public async Task<CartDto> GetCartAsync(int? userId, string? guestId, CancellationToken cancellationToken = default)
        {
            if (!userId.HasValue && string.IsNullOrWhiteSpace(guestId))
            {
                return new CartDto();
            }

            var spec = new CartWithItemsSpec(userId, guestId);
            var cart = await _cartRepository.FirstOrDefaultAsync(spec, cancellationToken);

            if (cart == null)
            {
                return new CartDto
                {
                    UserId = userId,
                    GuestId = guestId
                };
            }

            var activeItems = cart.Items.Where(i => !i.IsDeleted).ToList();
            var itemDtos = new List<CartItemDto>();
            var hasCartChanges = false;

            foreach (var item in activeItems)
            {
                var variant = item.ProductVariant;
                var product = variant?.Product;

                var isProductActive = product != null && product.IsActive && !product.IsDeleted;
                var isVariantActive = variant != null && variant.IsActive && !variant.IsDeleted;
                var quantityInStock = variant?.QuantityInStock ?? 0;
                var isAvailable = isProductActive && isVariantActive && quantityInStock > 0;

                if (item.Quantity > quantityInStock)
                {
                    item.Quantity = 1;
                    item.LastModifiedOn = DateTimeOffset.UtcNow;
                    hasCartChanges = true;
                }

                var unitPrice = variant?.Price ?? item.UnitPrice;
                var lineTotal = unitPrice * item.Quantity;

                var colorValueId = variant?.VariantValues
                    .FirstOrDefault(vv => !string.IsNullOrEmpty(vv.OptionValue?.ColorHexCode))?
                    .OptionValueId;

                var colorImage = colorValueId.HasValue
                    ? product?.Images?.FirstOrDefault(img => img.OptionValueId == colorValueId.Value)?.ImageUrl
                    : null;

                var primaryImage = product?.Images?.FirstOrDefault(img => img.IsPrimary)?.ImageUrl
                    ?? product?.Images?.FirstOrDefault()?.ImageUrl;

                var imageUrl = colorImage ?? primaryImage;

                var attributes = variant?.VariantValues?
                    .Select(vv => new CartItemAttributeDto
                    {
                        OptionName = vv.OptionValue?.Option?.Name ?? string.Empty,
                        Value = vv.OptionValue?.Value ?? string.Empty,
                        ColorHexCode = vv.OptionValue?.ColorHexCode
                    }).ToList() ?? new List<CartItemAttributeDto>();

                itemDtos.Add(new CartItemDto
                {
                    Id = item.Id,
                    CartId = item.CartId,
                    ProductVariantId = item.ProductVariantId,
                    ProductId = product?.Id ?? 0,
                    ProductName = product?.Name ?? "Sản phẩm không xác định",
                    ProductSlug = product?.Slug ?? string.Empty,
                    SKU = variant?.SKU ?? string.Empty,
                    VariantName = variant?.VariantName,
                    ImageUrl = imageUrl,
                    UnitPrice = unitPrice,
                    OriginalPrice = item.UnitPrice,
                    CompareAtPrice = variant?.CompareAtPrice,
                    Quantity = item.Quantity,
                    QuantityInStock = quantityInStock,
                    IsSelected = item.IsSelected,
                    IsActive = isProductActive && isVariantActive,
                    IsAvailable = isAvailable,
                    LineTotal = lineTotal,
                    Attributes = attributes
                });
            }

            if (hasCartChanges)
            {
                cart.LastModifiedOn = DateTimeOffset.UtcNow;
                await _cartRepository.SaveChangesAsync(cancellationToken);
            }

            var availableItems = itemDtos.Where(i => i.IsAvailable).ToList();
            var totalItems = availableItems.Sum(i => i.Quantity);
            var selectedItems = availableItems.Where(i => i.IsSelected).ToList();
            var selectedItemsCount = selectedItems.Sum(i => i.Quantity);
            var subtotal = selectedItems.Sum(i => i.LineTotal);

            return new CartDto
            {
                Id = cart.Id,
                UserId = cart.UserId,
                GuestId = cart.GuestId,
                TotalItems = totalItems,
                SelectedItemsCount = selectedItemsCount,
                Subtotal = subtotal,
                Items = itemDtos
            };
        }

        public async Task AddToCartAsync(int? userId, AddToCartRequest request, CancellationToken cancellationToken = default)
        {
            if (request.Quantity <= 0)
            {
                throw new BusinessRuleException("Số lượng sản phẩm thêm vào giỏ phải lớn hơn 0.");
            }

            var variantSpec = new VariantByIdWithDetailsSpec(request.ProductVariantId);
            var variant = await _variantRepository.FirstOrDefaultAsync(variantSpec, cancellationToken);

            if (variant == null)
            {
                throw new NotFoundException("Biến thể sản phẩm không tồn tại hoặc đã ngừng kinh doanh.");
            }

            if (!variant.IsActive || variant.IsDeleted || variant.Product == null || !variant.Product.IsActive || variant.Product.IsDeleted)
            {
                throw new BusinessRuleException("Sản phẩm hiện đang tạm ngừng kinh doanh.");
            }

            if (variant.QuantityInStock <= 0)
            {
                throw new BusinessRuleException("Sản phẩm này hiện đã tạm hết hàng.");
            }

            if (request.Quantity > variant.QuantityInStock)
            {
                throw new BusinessRuleException($"Số lượng yêu cầu ({request.Quantity}) vượt quá số lượng tồn kho còn lại ({variant.QuantityInStock} sản phẩm).");
            }

            var cart = await GetOrCreateCartAsync(userId, request.GuestId, cancellationToken);

            var existingItem = cart.Items.FirstOrDefault(i => i.ProductVariantId == request.ProductVariantId && !i.IsDeleted);

            if (existingItem != null)
            {
                var targetQuantity = existingItem.Quantity + request.Quantity;
                if (targetQuantity > variant.QuantityInStock)
                {
                    throw new BusinessRuleException($"Tổng số lượng trong giỏ ({targetQuantity}) vượt quá tồn kho còn lại ({variant.QuantityInStock} sản phẩm).");
                }

                existingItem.Quantity = targetQuantity;
                existingItem.UnitPrice = variant.Price;
                existingItem.IsActive = true;
                existingItem.IsSelected = true;
                existingItem.LastModifiedOn = DateTimeOffset.UtcNow;
            }
            else
            {
                cart.AddItem(variant.Id, request.Quantity, variant.Price);
            }

            cart.LastModifiedOn = DateTimeOffset.UtcNow;
            await _cartRepository.SaveChangesAsync(cancellationToken);
        }

        public async Task UpdateQuantityAsync(int? userId, UpdateCartItemQuantityRequest request, CancellationToken cancellationToken = default)
        {
            var cart = await GetCartOrThrowAsync(userId, request.GuestId, cancellationToken);

            var item = cart.Items.FirstOrDefault(i => i.ProductVariantId == request.ProductVariantId && !i.IsDeleted);
            if (item == null)
            {
                throw new NotFoundException("Sản phẩm không tồn tại trong giỏ hàng.");
            }

            if (request.Quantity <= 0)
            {
                item.IsDeleted = true;
                item.DeletedOn = DateTimeOffset.UtcNow;
            }
            else
            {
                var variant = await _variantRepository.GetByIdAsync(request.ProductVariantId, cancellationToken);
                if (variant == null || variant.IsDeleted || !variant.IsActive)
                {
                    throw new BusinessRuleException("Biến thể sản phẩm hiện không khả dụng.");
                }

                if (request.Quantity > variant.QuantityInStock)
                {
                    throw new BusinessRuleException($"Số lượng yêu cầu ({request.Quantity}) vượt quá tồn kho còn lại ({variant.QuantityInStock} sản phẩm).");
                }

                item.Quantity = request.Quantity;
                item.UnitPrice = variant.Price;
                item.LastModifiedOn = DateTimeOffset.UtcNow;
            }

            cart.LastModifiedOn = DateTimeOffset.UtcNow;
            await _cartRepository.SaveChangesAsync(cancellationToken);
        }

        public async Task UpdateSelectionAsync(int? userId, UpdateCartItemSelectionRequest request, CancellationToken cancellationToken = default)
        {
            var cart = await GetCartOrThrowAsync(userId, request.GuestId, cancellationToken);

            var item = cart.Items.FirstOrDefault(i => i.ProductVariantId == request.ProductVariantId && !i.IsDeleted);
            if (item == null)
            {
                throw new NotFoundException("Sản phẩm không tồn tại trong giỏ hàng.");
            }

            item.IsSelected = request.IsSelected;
            item.LastModifiedOn = DateTimeOffset.UtcNow;

            cart.LastModifiedOn = DateTimeOffset.UtcNow;
            await _cartRepository.SaveChangesAsync(cancellationToken);
        }

        public async Task ChangeItemVariantAsync(int? userId, ChangeCartItemVariantRequest request, CancellationToken cancellationToken = default)
        {
            var cart = await GetCartOrThrowAsync(userId, request.GuestId, cancellationToken);

            var targetItem = cart.Items.FirstOrDefault(i => i.Id == request.CartItemId && !i.IsDeleted);
            if (targetItem == null)
            {
                throw new NotFoundException("Mặt hàng không tồn tại trong giỏ hàng.");
            }

            if (targetItem.ProductVariantId == request.NewProductVariantId)
            {
                return;
            }

            var newVariant = await _variantRepository.FirstOrDefaultAsync(new VariantByIdWithDetailsSpec(request.NewProductVariantId), cancellationToken);
            if (newVariant == null || newVariant.IsDeleted)
            {
                throw new NotFoundException("Phiên bản sản phẩm mới không tồn tại.");
            }

            if (!newVariant.IsActive)
            {
                throw new BusinessRuleException("Phiên bản sản phẩm mới hiện đang tạm ngừng kinh doanh.");
            }

            if (newVariant.QuantityInStock <= 0)
            {
                throw new BusinessRuleException("Phiên bản sản phẩm mới hiện đã tạm hết hàng.");
            }

            var existingItem = cart.Items.FirstOrDefault(i => !i.IsDeleted && i.Id != targetItem.Id && i.ProductVariantId == request.NewProductVariantId);

            if (existingItem != null)
            {
                var mergedQuantity = existingItem.Quantity + targetItem.Quantity;
                if (mergedQuantity > newVariant.QuantityInStock)
                {
                    mergedQuantity = newVariant.QuantityInStock;
                }

                existingItem.Quantity = mergedQuantity;
                existingItem.UnitPrice = newVariant.Price;
                existingItem.IsSelected = true;
                existingItem.LastModifiedOn = DateTimeOffset.UtcNow;

                cart.RemoveItemById(targetItem.Id);
            }
            else
            {
                var nextQuantity = targetItem.Quantity;
                if (nextQuantity > newVariant.QuantityInStock)
                {
                    nextQuantity = newVariant.QuantityInStock;
                }

                targetItem.ProductVariantId = newVariant.Id;
                targetItem.UnitPrice = newVariant.Price;
                targetItem.Quantity = nextQuantity;
                targetItem.IsSelected = true;
                targetItem.LastModifiedOn = DateTimeOffset.UtcNow;
            }

            cart.LastModifiedOn = DateTimeOffset.UtcNow;
            await _cartRepository.SaveChangesAsync(cancellationToken);
        }

        public async Task RemoveItemAsync(int? userId, string? guestId, int productVariantId, CancellationToken cancellationToken = default)
        {
            var cart = await FindCartAsync(userId, guestId, cancellationToken);
            if (cart == null)
            {
                return;
            }

            var item = cart.Items.FirstOrDefault(i => i.ProductVariantId == productVariantId && !i.IsDeleted);
            if (item != null)
            {
                item.IsDeleted = true;
                item.DeletedOn = DateTimeOffset.UtcNow;
                cart.LastModifiedOn = DateTimeOffset.UtcNow;
                await _cartRepository.SaveChangesAsync(cancellationToken);
            }
        }

        public async Task ClearCartAsync(int? userId, string? guestId, CancellationToken cancellationToken = default)
        {
            var cart = await FindCartAsync(userId, guestId, cancellationToken);
            if (cart == null)
            {
                return;
            }

            cart.Clear();
            cart.LastModifiedOn = DateTimeOffset.UtcNow;
            await _cartRepository.SaveChangesAsync(cancellationToken);
        }

        public async Task MergeCartAsync(int userId, MergeCartRequest request, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(request.GuestId))
            {
                return;
            }

            var guestCart = await _cartRepository.FirstOrDefaultAsync(new CartByGuestIdSpec(request.GuestId), cancellationToken);
            if (guestCart == null || !guestCart.Items.Any(i => !i.IsDeleted))
            {
                return;
            }

            var userCart = await _cartRepository.FirstOrDefaultAsync(new CartByUserIdSpec(userId), cancellationToken);
            if (userCart == null)
            {
                userCart = new Cart
                {
                    UserId = userId
                };
                await _cartRepository.AddAsync(userCart, cancellationToken);
                await _cartRepository.SaveChangesAsync(cancellationToken);
            }

            var guestActiveItems = guestCart.Items.Where(i => !i.IsDeleted).ToList();

            foreach (var guestItem in guestActiveItems)
            {
                var variant = await _variantRepository.GetByIdAsync(guestItem.ProductVariantId, cancellationToken);
                if (variant == null || variant.IsDeleted || !variant.IsActive)
                {
                    continue;
                }

                var existingUserItem = userCart.Items.FirstOrDefault(i => i.ProductVariantId == guestItem.ProductVariantId && !i.IsDeleted);

                if (existingUserItem != null)
                {
                    var mergedQuantity = existingUserItem.Quantity + guestItem.Quantity;
                    if (variant.QuantityInStock > 0 && mergedQuantity > variant.QuantityInStock)
                    {
                        mergedQuantity = variant.QuantityInStock;
                    }

                    existingUserItem.Quantity = Math.Max(1, mergedQuantity);
                    existingUserItem.UnitPrice = variant.Price;
                    existingUserItem.IsSelected = true;
                    existingUserItem.LastModifiedOn = DateTimeOffset.UtcNow;
                }
                else
                {
                    var addQuantity = guestItem.Quantity;
                    if (variant.QuantityInStock > 0 && addQuantity > variant.QuantityInStock)
                    {
                        addQuantity = variant.QuantityInStock;
                    }

                    if (addQuantity > 0)
                    {
                        userCart.AddItem(guestItem.ProductVariantId, addQuantity, variant.Price);
                    }
                }

                guestItem.IsDeleted = true;
                guestItem.DeletedOn = DateTimeOffset.UtcNow;
            }

            guestCart.IsDeleted = true;
            guestCart.DeletedOn = DateTimeOffset.UtcNow;
            userCart.LastModifiedOn = DateTimeOffset.UtcNow;

            await _cartRepository.SaveChangesAsync(cancellationToken);
        }

        private async Task<Cart> GetOrCreateCartAsync(int? userId, string? guestId, CancellationToken cancellationToken)
        {
            if (userId.HasValue)
            {
                var userCart = await _cartRepository.FirstOrDefaultAsync(new CartByUserIdSpec(userId.Value), cancellationToken);
                if (userCart != null)
                {
                    return userCart;
                }

                var newCart = new Cart
                {
                    UserId = userId.Value
                };
                await _cartRepository.AddAsync(newCart, cancellationToken);
                await _cartRepository.SaveChangesAsync(cancellationToken);
                return newCart;
            }

            var resolvedGuestId = string.IsNullOrWhiteSpace(guestId) ? Guid.NewGuid().ToString("N") : guestId;
            var guestCart = await _cartRepository.FirstOrDefaultAsync(new CartByGuestIdSpec(resolvedGuestId), cancellationToken);

            if (guestCart != null)
            {
                return guestCart;
            }

            var newGuestCart = new Cart
            {
                GuestId = resolvedGuestId,
                ExpiresOn = DateTimeOffset.UtcNow.AddDays(14)
            };

            await _cartRepository.AddAsync(newGuestCart, cancellationToken);
            await _cartRepository.SaveChangesAsync(cancellationToken);
            return newGuestCart;
        }

        private async Task<Cart> GetCartOrThrowAsync(int? userId, string? guestId, CancellationToken cancellationToken)
        {
            var cart = await FindCartAsync(userId, guestId, cancellationToken);
            if (cart == null)
            {
                throw new NotFoundException("Không tìm thấy giỏ hàng.");
            }
            return cart;
        }

        private async Task<Cart?> FindCartAsync(int? userId, string? guestId, CancellationToken cancellationToken)
        {
            if (userId.HasValue)
            {
                return await _cartRepository.FirstOrDefaultAsync(new CartByUserIdSpec(userId.Value), cancellationToken);
            }

            if (!string.IsNullOrWhiteSpace(guestId))
            {
                return await _cartRepository.FirstOrDefaultAsync(new CartByGuestIdSpec(guestId), cancellationToken);
            }

            return null;
        }
    }
}
