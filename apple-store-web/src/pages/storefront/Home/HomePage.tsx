import { useRef, useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { Link } from "react-router-dom";
import {
  ThunderboltOutlined,
  ArrowRightOutlined,
  LeftOutlined,
  RightOutlined,
  ShoppingCartOutlined,
  LaptopOutlined,
  MobileOutlined,
  TabletOutlined,
  ClockCircleOutlined,
  CustomerServiceOutlined,
  DesktopOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useHomeShowcase, useCategories } from "@features/storefront/catalog";
import type { ProductCardItem, Category } from "@features/storefront/catalog";
import { AppleLogo, UrbanStitchLogo } from "@shared/components/icons";

const getCategoryIcon = (slug?: string, name?: string) => {
  const key = `${slug || ""} ${name || ""}`.toLowerCase();
  if (key.includes("macbook") || key.includes("laptop")) {
    return <LaptopOutlined className="text-xl sm:text-2xl" />;
  }
  if (key.includes("iphone") || key.includes("phone")) {
    return <MobileOutlined className="text-xl sm:text-2xl" />;
  }
  if (key.includes("ipad") || key.includes("tablet")) {
    return <TabletOutlined className="text-xl sm:text-2xl" />;
  }
  if (key.includes("watch") || key.includes("đồng hồ")) {
    return <ClockCircleOutlined className="text-xl sm:text-2xl" />;
  }
  if (key.includes("airpod") || key.includes("âm thanh") || key.includes("tai nghe")) {
    return <CustomerServiceOutlined className="text-xl sm:text-2xl" />;
  }
  if (key.includes("imac") || key.includes("desktop") || key.includes("mini") || key.includes("studio")) {
    return <DesktopOutlined className="text-xl sm:text-2xl" />;
  }
  if (key.includes("phụ kiện") || key.includes("accessory")) {
    return <AppstoreOutlined className="text-xl sm:text-2xl" />;
  }
  return <AppleLogo size={22} />;
};

const formatVND = (price?: number) => {
  if (!price) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
};

const CategoryCarouselItem = ({ cat }: { cat: Category }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      to={`/products?category=${cat.slug}`}
      data-testid={`carousel-category-item-${cat.slug}`}
      className="group shrink-0 w-36 sm:w-44 flex flex-col items-center justify-center p-4 sm:p-5 bg-white rounded-2xl border border-slate-100 hover:border-blue-500 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer text-center no-underline"
    >
      <div className="w-14 h-14 rounded-xl bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center text-blue-600 mb-3 transition-colors overflow-hidden">
        {cat.imageUrl && !imgError ? (
          <img
            src={cat.imageUrl}
            alt={cat.name}
            onError={() => setImgError(true)}
            className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-200"
          />
        ) : (
          <AppleLogo size={24} className="text-blue-600 group-hover:scale-110 transition-transform duration-200" />
        )}
      </div>
      <h3 className="font-bold text-slate-800 text-xs sm:text-sm group-hover:text-blue-600 transition-colors line-clamp-1">
        {cat.name}
      </h3>
      <span className="text-[11px] text-slate-400 mt-0.5">
        {cat.productCount ? `${cat.productCount} sản phẩm` : "Chính hãng"}
      </span>
    </Link>
  );
};

interface CategoryProductCardProps {
  product: ProductCardItem;
  onAddToCart: (product: ProductCardItem) => void;
}

const CategoryProductCard = ({
  product,
  onAddToCart,
}: CategoryProductCardProps) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      data-testid={`product-card-${product.id}`}
      className="group/card relative h-full flex flex-col justify-between bg-white rounded-2xl border border-slate-200 hover:border-blue-500/80 p-5 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="flex flex-col flex-1">
        <div className="h-7 flex items-center justify-between gap-2 mb-3">
          <span
            data-testid={`chip-badge-${product.id}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px] font-semibold tracking-wide shadow-xs shrink-0 truncate max-w-[65%]"
          >
            <ThunderboltOutlined className="text-[10px] text-amber-400 shrink-0" />
            <span className="truncate">{product.chipName || "Apple Silicon"}</span>
          </span>

          <span
            data-testid={`status-badge-${product.id}`}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shrink-0 ${product.badgeText === "BÁN CHẠY"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
          >
            {product.badgeText || "SẴN HÀNG"}
          </span>
        </div>

        <div
          data-testid="product-image-container"
          className="w-full h-48 sm:h-52 bg-white rounded-xl flex items-center justify-center p-3 overflow-hidden border border-slate-50"
        >
          {!imgError && product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              onError={() => setImgError(true)}
              className="max-h-full max-w-full object-contain group-hover/card:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5 text-slate-300 group-hover/card:text-blue-500 transition-colors duration-300">
              <AppleLogo size={52} />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Urban Stitch</span>
            </div>
          )}
        </div>

        <h4 className="h-12 flex items-center font-bold text-slate-900 text-sm sm:text-base group-hover/card:text-blue-600 transition-colors line-clamp-2 mt-3 leading-snug">
          {product.name}
        </h4>

        <div className="h-14 flex items-center mt-2.5 text-xs text-slate-500 leading-relaxed bg-slate-50 rounded-lg p-2.5 border border-slate-100 line-clamp-2">
          <span className="line-clamp-2">
            {product.shortDescription || "Mới 100% Nguyên seal chính hãng VN/A"}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-medium">Chỉ từ</span>
          <span className="text-lg sm:text-xl font-black text-blue-600 tracking-tight">
            {formatVND(product.price)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAddToCart(product)}
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white transition-colors cursor-pointer"
          title="Thêm vào giỏ hàng"
          aria-label="Thêm vào giỏ hàng"
        >
          <ShoppingCartOutlined className="text-base" />
        </button>
      </div>
    </div>
  );
};

export const HomePage = () => {
  const { data: showcase, isLoading: isShowcaseLoading } = useHomeShowcase(4);
  const { data: categories } = useCategories();
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentScrollRef = useRef(0);
  const isInteractingRef = useRef(false);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loopedCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    const repeatCount = Math.max(6, Math.ceil(30 / categories.length));
    const result = [];
    for (let i = 0; i < repeatCount; i++) {
      result.push(...categories);
    }
    return result;
  }, [categories]);

  const categoryGroups = useMemo(() => {
    if (!showcase || showcase.length === 0) return [];

    return showcase.map((group) => ({
      category: {
        id: group.categoryId,
        name: group.categoryName,
        slug: group.categorySlug,
        description: group.categoryDescription,
      },
      items: group.products,
    }));
  }, [showcase]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !categories || categories.length === 0) return;

    const calculateCycleWidth = () => {
      const item0 = container.children[0] as HTMLElement | undefined;
      const itemN = container.children[categories.length] as HTMLElement | undefined;
      if (item0 && itemN) {
        return itemN.offsetLeft - item0.offsetLeft;
      }
      return 0;
    };

    let cycleWidth = calculateCycleWidth();
    if (cycleWidth > 0 && container.scrollLeft === 0) {
      container.scrollLeft = cycleWidth * 2;
      currentScrollRef.current = cycleWidth * 2;
    }

    let animationFrameId: number;
    let lastTime = performance.now();
    const speed = 40;

    const step = (now: number) => {
      const elapsed = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!isInteractingRef.current && container) {
        if (cycleWidth <= 0) {
          cycleWidth = calculateCycleWidth();
        }

        currentScrollRef.current += speed * elapsed;

        if (cycleWidth > 0) {
          if (currentScrollRef.current >= cycleWidth * 3) {
            currentScrollRef.current -= cycleWidth;
          } else if (currentScrollRef.current < cycleWidth) {
            currentScrollRef.current += cycleWidth;
          }
        }

        container.scrollLeft = currentScrollRef.current;
      }

      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, [categories, loopedCategories]);

  const triggerPauseTemporarily = () => {
    isInteractingRef.current = true;
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    pauseTimeoutRef.current = setTimeout(() => {
      isInteractingRef.current = false;
      if (scrollRef.current) {
        currentScrollRef.current = scrollRef.current.scrollLeft;
      }
    }, 1200);
  };

  const handleScrollLeft = () => {
    const container = scrollRef.current;
    if (!container || !categories || categories.length === 0) return;
    triggerPauseTemporarily();

    const item0 = container.children[0] as HTMLElement | undefined;
    const itemN = container.children[categories.length] as HTMLElement | undefined;
    const cycleWidth = item0 && itemN ? itemN.offsetLeft - item0.offsetLeft : 300;

    let target = container.scrollLeft - 300;
    if (target < cycleWidth) {
      container.scrollLeft += cycleWidth;
      target += cycleWidth;
    }
    container.scrollTo({ left: target, behavior: "smooth" });
    currentScrollRef.current = target;
  };

  const handleScrollRight = () => {
    const container = scrollRef.current;
    if (!container || !categories || categories.length === 0) return;
    triggerPauseTemporarily();

    const item0 = container.children[0] as HTMLElement | undefined;
    const itemN = container.children[categories.length] as HTMLElement | undefined;
    const cycleWidth = item0 && itemN ? itemN.offsetLeft - item0.offsetLeft : 300;

    let target = container.scrollLeft + 300;
    if (target >= cycleWidth * 3) {
      container.scrollLeft -= cycleWidth;
      target -= cycleWidth;
    }
    container.scrollTo({ left: target, behavior: "smooth" });
    currentScrollRef.current = target;
  };

  const handleScroll = () => {
    if (!isInteractingRef.current) return;
    const container = scrollRef.current;
    if (!container || !categories || categories.length === 0) return;
    const item0 = container.children[0] as HTMLElement | undefined;
    const itemN = container.children[categories.length] as HTMLElement | undefined;
    if (!item0 || !itemN) return;
    const cycleWidth = itemN.offsetLeft - item0.offsetLeft;
    if (cycleWidth <= 0) return;

    if (container.scrollLeft < cycleWidth * 0.8) {
      container.scrollLeft += cycleWidth;
      currentScrollRef.current = container.scrollLeft;
    } else if (container.scrollLeft >= cycleWidth * 3.2) {
      container.scrollLeft -= cycleWidth;
      currentScrollRef.current = container.scrollLeft;
    }
  };

  const handleAddToCart = (product: ProductCardItem) => {
    message.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  return (
    <div className="space-y-20 pb-16 select-none">
      <section className="relative w-full overflow-hidden bg-white text-slate-900 pt-12 sm:pt-16 pb-6 border-b border-slate-200/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(37,99,235,0.06),transparent_70%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10 px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full bg-blue-50/80 border border-blue-100 text-blue-700 text-xs font-semibold tracking-wide">
            <UrbanStitchLogo size={16} useGradient />
            <span>Hệ Thống Bán Lẻ &amp; Phân Phối Apple Chính Hãng</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl leading-tight text-slate-900">
            Nâng Tầm Trải Nghiệm Công Nghệ Đỉnh Cao
          </h1>

          <p className="text-base sm:text-xl font-semibold text-slate-700 mt-3 sm:mt-4 tracking-tight max-w-3xl">
            Không gian công nghệ Apple chuẩn mực cùng hệ sinh thái thiết bị đỉnh cao.
          </p>

          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-2 leading-relaxed">
            Cam kết 100% sản phẩm chính hãng, bảo hành chuẩn mực toàn quốc cùng chính sách thu cũ đổi mới và trả góp linh hoạt.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-7">
            <a
              href="#categories"
              className="inline-flex items-center gap-2 h-11 sm:h-12 px-7 sm:px-8 rounded-full font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <AppstoreOutlined className="text-sm sm:text-base" />
              <span>Khám phá sản phẩm</span>
            </a>

            <a
              href="#categories"
              onClick={(e) => {
                e.preventDefault();
                message.info("Chính sách bảo hành 12 tháng chính hãng và đổi mới 30 ngày tại Urban Stitch!");
              }}
              className="inline-flex items-center gap-2 h-11 sm:h-12 px-6 rounded-full font-semibold text-xs sm:text-sm text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 transition-all"
            >
              <span>Chính sách &amp; Ưu đãi</span>
              <RightOutlined className="text-xs" />
            </a>
          </div>

          <div className="relative w-full max-w-5xl mx-auto mt-4 sm:mt-6 flex justify-center">
            <img
              src="/apple-ecosystem-hero.png"
              alt="Hệ sinh thái Apple chính hãng tại Urban Stitch"
              className="w-full max-w-190 lg:max-w-220 h-auto object-contain select-none pointer-events-none drop-shadow-sm"
            />
          </div>
        </div>
      </section>

      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Khám Phá Theo Nhóm
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Danh Mục Sản Phẩm Apple
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-sm">
            Tất cả thiết bị đều được nhập khẩu chính ngạch, nguyên seal và bảo hành chính hãng AppleCare Việt Nam.
          </p>
        </div>

        <div className="relative group/carousel">
          <button
            type="button"
            onClick={handleScrollLeft}
            aria-label="Cuộn sang trái"
            className="absolute -left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-blue-600 shadow-md hover:shadow-lg border border-slate-200 transition-all cursor-pointer hover:scale-105"
          >
            <LeftOutlined className="text-xs" />
          </button>

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            onTouchStart={() => {
              isInteractingRef.current = true;
            }}
            onTouchEnd={() => {
              triggerPauseTemporarily();
            }}
            className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 px-1 no-scrollbar select-none"
          >
            {loopedCategories.map((cat, idx) => (
              <CategoryCarouselItem key={`${cat.id}-${idx}`} cat={cat} />
            ))}
          </div>

          <button
            type="button"
            onClick={handleScrollRight}
            aria-label="Cuộn sang phải"
            className="absolute -right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-blue-600 shadow-md hover:shadow-lg border border-slate-200 transition-all cursor-pointer hover:scale-105"
          >
            <RightOutlined className="text-xs" />
          </button>
        </div>
      </section>

      {isShowcaseLoading ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
          {[1, 2, 3].map((placeholderIdx) => (
            <div key={placeholderIdx} className="space-y-6">
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 animate-pulse mb-3" />
                <div className="w-48 h-6 bg-slate-200 rounded-md animate-pulse mb-2" />
                <div className="w-72 h-4 bg-slate-100 rounded-md animate-pulse" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((itemIdx) => (
                  <div key={itemIdx} className="h-96 rounded-2xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </section>
      ) : (
        <div className="space-y-20">
          {categoryGroups.map((group) => (
            <section
              key={group.category.id}
              data-testid={`category-block-${group.category.slug}`}
              className="max-w-7xl mx-auto px-4 sm:px-6"
            >
              <div className="flex flex-col items-center justify-center text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mb-3 shadow-xs border border-blue-100">
                  {getCategoryIcon(group.category.slug, group.category.name)}
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {group.category.name}
                </h3>
                {group.category.description && (
                  <p className="text-xs sm:text-sm text-slate-500 max-w-xl mt-1.5 leading-relaxed">
                    {group.category.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                {group.items.map((product) => (
                  <CategoryProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>

              <div className="flex justify-center mt-8">
                <Link
                  to={`/products?category=${group.category.slug}`}
                  data-testid={`view-all-${group.category.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 hover:gap-3 transition-all cursor-pointer py-2.5 px-6 rounded-full bg-blue-50/60 hover:bg-blue-100/80 border border-blue-200/60 shadow-xs"
                >
                  <span>Xem tất cả {group.category.name}</span>
                  <ArrowRightOutlined className="text-xs transition-transform" />
                </Link>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
