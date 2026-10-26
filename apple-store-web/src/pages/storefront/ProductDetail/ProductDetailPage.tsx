import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { message, Spin, Empty, Button, Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import {
  useProductDetail,
  ProductHeroSection,
  ProductSpecifications,
  ProductRelatedCarousel,
} from "@features/storefront/catalog";
import type {
  ProductVariantDetail,
  GalleryImageItem,
} from "@features/storefront/catalog";
import { useAddToCart } from "@features/storefront/cart";

export const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProductDetail(slug);
  const { mutate: addToCart } = useAddToCart();

  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [slug]);

  useEffect(() => {
    if (product?.options && product.options.length > 0) {
      const initial: Record<number, number> = {};

      const activeVars = (product.variants || []).filter((v) => v.isActive !== false);
      const inStockVars = activeVars.filter(
        (v) => (v.quantityInStock ?? v.stockQuantity ?? 0) > 0
      );

      const primaryImg = product.images?.find((img) => img.isPrimary && img.optionValueId);
      let defaultVariant = inStockVars.find((v) =>
        primaryImg ? (v.optionValueIds || []).includes(primaryImg.optionValueId!) : false
      );

      if (!defaultVariant) {
        defaultVariant = inStockVars[0] || activeVars[0] || product.variants?.[0];
      }

      if (defaultVariant && defaultVariant.variantValues && defaultVariant.variantValues.length > 0) {
        defaultVariant.variantValues.forEach((vv) => {
          if (vv.optionId && vv.optionValueId) {
            initial[vv.optionId] = vv.optionValueId;
          }
        });
      }

      product.options.forEach((opt) => {
        if (!initial[opt.id]) {
          const validVal =
            opt.values.find((val) =>
              activeVars.some(
                (v) =>
                  (v.optionValueIds || []).includes(val.id) &&
                  (v.quantityInStock ?? v.stockQuantity ?? 0) > 0
              )
            ) ||
            opt.values.find((val) =>
              activeVars.some((v) => (v.optionValueIds || []).includes(val.id))
            ) ||
            opt.values[0];

          if (validVal) {
            initial[opt.id] = validVal.id;
          }
        }
      });

      setSelectedOptions(initial);
      setActiveImageIndex(0);
      setQuantity(1);
    }
  }, [product]);

  const selectedVariant: ProductVariantDetail | undefined = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return undefined;
    const optionIds = (product.options || []).map((o) => o.id);

    if (optionIds.length === 0) {
      return product.variants.find((v) => v.isActive !== false) || product.variants[0];
    }

    const exactMatch = product.variants.find((v) => {
      if (v.isActive === false) return false;
      const vOptValIds = v.optionValueIds || [];
      return optionIds.every((optId) => {
        const selectedValId = selectedOptions[optId];
        return selectedValId !== undefined && vOptValIds.includes(selectedValId);
      });
    });

    return exactMatch;
  }, [product, selectedOptions]);

  const availableStock = selectedVariant
    ? selectedVariant.quantityInStock ?? selectedVariant.stockQuantity ?? 0
    : 0;

  const colorOption = useMemo(() => {
    return product?.options?.find(
      (opt) =>
        opt.name.toLowerCase().includes("màu") ||
        opt.values.some((v) => Boolean(v.colorHexCode))
    );
  }, [product]);

  const selectedColorId = colorOption ? selectedOptions[colorOption.id] : undefined;

  const galleryImages: GalleryImageItem[] = useMemo(() => {
    if (!product) return [];

    if (product.images && product.images.length > 0) {
      const validDbImages = product.images.filter(
        (img) => Boolean(img.imageUrl && typeof img.imageUrl === "string" && img.imageUrl.trim().length > 0)
      );

      if (validDbImages.length > 0) {
        if (selectedColorId) {
          const colorImages = validDbImages.filter(
            (img) => img.optionValueId === selectedColorId
          );
          if (colorImages.length > 0) {
            const sortedColorImages = [...colorImages].sort((a, b) => {
              if (a.isPrimary && !b.isPrimary) return -1;
              if (!a.isPrimary && b.isPrimary) return 1;
              return a.displayOrder - b.displayOrder;
            });
            const generalImages = validDbImages.filter((img) => !img.optionValueId);
            return [...sortedColorImages, ...generalImages].map((img) => ({
              id: img.id,
              imageUrl: img.imageUrl!,
              altText: img.altText || `${product.name} - ${img.optionValueName || ""}`,
              colorId: img.optionValueId ?? undefined,
              colorName: img.optionValueName ?? undefined,
            }));
          }
        }

        const sortedImages = [...validDbImages].sort((a, b) => {
          if (a.isPrimary && !b.isPrimary) return -1;
          if (!a.isPrimary && b.isPrimary) return 1;
          return a.displayOrder - b.displayOrder;
        });

        return sortedImages.map((img) => ({
          id: img.id,
          imageUrl: img.imageUrl!,
          altText: img.altText || `${product.name} - ${img.optionValueName || ""}`,
          colorId: img.optionValueId ?? undefined,
          colorName: img.optionValueName ?? undefined,
        }));
      }
    }

    if (product.variants && product.variants.length > 0) {
      const items: GalleryImageItem[] = [];
      const seenUrls = new Set<string>();
      product.variants.forEach((v) => {
        if (
          v.primaryImageUrl &&
          typeof v.primaryImageUrl === "string" &&
          v.primaryImageUrl.trim().length > 0 &&
          !seenUrls.has(v.primaryImageUrl)
        ) {
          seenUrls.add(v.primaryImageUrl);
          items.push({
            id: `variant-${v.id}`,
            imageUrl: v.primaryImageUrl,
            altText: `${product.name} - ${v.variantName || ""}`,
          });
        }
      });
      if (items.length > 0) return items;
    }

    return [];
  }, [product, selectedColorId]);

  const handleSelectOptionValue = (optionId: number, valueId: number, isColor = false) => {
    const activeVariants = (product?.variants || []).filter((v) => v.isActive !== false);
    const nextOptions = { ...selectedOptions, [optionId]: valueId };

    const exact = activeVariants.find((v) => {
      const vValIds = v.optionValueIds || [];
      return Object.entries(nextOptions).every(([, valId]) => vValIds.includes(valId));
    });

    if (exact) {
      setSelectedOptions(nextOptions);
    } else {
      const candidate =
        activeVariants.find(
          (v) =>
            (v.optionValueIds || []).includes(valueId) &&
            (v.quantityInStock ?? v.stockQuantity ?? 0) > 0
        ) ||
        activeVariants.find((v) => (v.optionValueIds || []).includes(valueId));

      if (candidate && candidate.variantValues && candidate.variantValues.length > 0) {
        const resolved = { ...nextOptions };
        candidate.variantValues.forEach((vv) => {
          if (vv.optionId && vv.optionValueId) {
            resolved[vv.optionId] = vv.optionValueId;
          }
        });
        setSelectedOptions(resolved);
      } else {
        setSelectedOptions(nextOptions);
      }
    }

    if (isColor && galleryImages.length > 0) {
      const matchedIdx = galleryImages.findIndex((img) => img.colorId === valueId);
      if (matchedIdx !== -1) {
        setActiveImageIndex(matchedIdx);
      } else {
        setActiveImageIndex(0);
      }
    }
  };

  const discountPercent =
    selectedVariant?.compareAtPrice &&
    selectedVariant.compareAtPrice > selectedVariant.price
      ? Math.round(
          ((selectedVariant.compareAtPrice - selectedVariant.price) /
            selectedVariant.compareAtPrice) *
            100
        )
      : null;

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    if (availableStock <= 0) {
      message.error("Phiên bản này hiện đã tạm hết hàng");
      return;
    }
    addToCart({
      productVariantId: selectedVariant.id,
      quantity,
    });
  };

  const handleBuyNow = () => {
    if (!product || !selectedVariant) return;
    if (availableStock <= 0) {
      message.error("Phiên bản này hiện đã tạm hết hàng");
      return;
    }
    addToCart(
      {
        productVariantId: selectedVariant.id,
        quantity,
      },
      {
        onSuccess: () => {
          navigate("/cart");
        },
      }
    );
  };

  const breadcrumbItems = product
    ? [
        {
          title: (
            <Link
              to="/"
              data-testid="breadcrumb-home"
              className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors"
            >
              <HomeOutlined />
              <span>Trang chủ</span>
            </Link>
          ),
        },
        {
          title: product.categoryName ? (
            <Link
              to={`/products?category=${product.categorySlug}`}
              data-testid="breadcrumb-category"
              className="text-slate-500 hover:text-blue-600 transition-colors"
            >
              {product.categoryName}
            </Link>
          ) : (
            <span>Sản phẩm</span>
          ),
        },
        {
          title: (
            <span
              data-testid="breadcrumb-current-product"
              className="font-bold text-slate-900 line-clamp-1 max-w-65 sm:max-w-none"
            >
              {product.name}
            </span>
          ),
        },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-slate-50/50">
        <Spin size="large" />
        <span className="text-sm font-semibold text-slate-500">
          Đang tải thông tin sản phẩm Apple...
        </span>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-slate-50/50 p-6 text-center">
        <Empty
          description={
            <div className="space-y-1">
              <p className="text-base font-bold text-slate-800">
                Không tìm thấy sản phẩm
              </p>
              <p className="text-xs text-slate-500">
                Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã ngừng kinh doanh.
              </p>
            </div>
          }
        />
        <Button
          type="primary"
          onClick={() => navigate("/products")}
          className="rounded-xl font-bold bg-blue-600"
        >
          Khám phá sản phẩm khác
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-8">
        <div data-testid="product-breadcrumb">
          <Breadcrumb items={breadcrumbItems} className="text-xs" />
        </div>

        <ProductHeroSection
          productName={product.name}
          categoryName={product.categoryName}
          modelCode={product.modelCode}
          warrantyMonths={product.warrantyMonths}
          images={galleryImages}
          activeImageIndex={activeImageIndex}
          onSelectImage={setActiveImageIndex}
          options={product.options || []}
          selectedOptions={selectedOptions}
          variants={product.variants || []}
          selectedVariant={selectedVariant}
          availableStock={availableStock}
          discountPercent={discountPercent}
          quantity={quantity}
          onSelectOptionValue={handleSelectOptionValue}
          onQuantityChange={setQuantity}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />

        <ProductSpecifications
          specificationGroups={product.specificationGroups}
          specifications={product.specifications}
          description={product.description}
          productName={product.name}
        />

        <ProductRelatedCarousel currentProductId={product.id} />
      </div>
    </div>
  );
};

export default ProductDetailPage;
