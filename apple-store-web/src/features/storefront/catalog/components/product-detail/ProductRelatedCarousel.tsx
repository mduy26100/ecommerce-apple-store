import { useRef, useEffect, useMemo } from "react";
import { message } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useRandomProducts } from "../../hooks/useCatalog";
import { ProductCard } from "../ProductCard";
import type { ProductCardItem } from "../../types/catalog.types";

export interface ProductRelatedCarouselProps {
  currentProductId?: number;
}

export const ProductRelatedCarousel = ({ currentProductId }: ProductRelatedCarouselProps) => {
  const { data: randomProducts, isLoading } = useRandomProducts(12, currentProductId);

  const scrollRef = useRef<HTMLDivElement>(null);
  const currentScrollRef = useRef(0);
  const isInteractingRef = useRef(false);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loopedProducts = useMemo(() => {
    if (!randomProducts || randomProducts.length === 0) return [];
    const repeatCount = Math.max(4, Math.ceil(24 / randomProducts.length));
    const result: ProductCardItem[] = [];
    for (let i = 0; i < repeatCount; i++) {
      result.push(...randomProducts);
    }
    return result;
  }, [randomProducts]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !randomProducts || randomProducts.length === 0) return;

    const calculateCycleWidth = () => {
      const item0 = container.children[0] as HTMLElement | undefined;
      const itemN = container.children[randomProducts.length] as HTMLElement | undefined;
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
    const speed = 35;

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
  }, [randomProducts, loopedProducts]);

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
    }, 1500);
  };

  const handleScrollLeft = () => {
    const container = scrollRef.current;
    if (!container || !randomProducts || randomProducts.length === 0) return;
    triggerPauseTemporarily();

    const item0 = container.children[0] as HTMLElement | undefined;
    const itemN = container.children[randomProducts.length] as HTMLElement | undefined;
    const cycleWidth = item0 && itemN ? itemN.offsetLeft - item0.offsetLeft : 320;

    let target = container.scrollLeft - 320;
    if (target < cycleWidth) {
      container.scrollLeft += cycleWidth;
      target += cycleWidth;
    }
    container.scrollTo({ left: target, behavior: "smooth" });
    currentScrollRef.current = target;
  };

  const handleScrollRight = () => {
    const container = scrollRef.current;
    if (!container || !randomProducts || randomProducts.length === 0) return;
    triggerPauseTemporarily();

    const item0 = container.children[0] as HTMLElement | undefined;
    const itemN = container.children[randomProducts.length] as HTMLElement | undefined;
    const cycleWidth = item0 && itemN ? itemN.offsetLeft - item0.offsetLeft : 320;

    let target = container.scrollLeft + 320;
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
    if (!container || !randomProducts || randomProducts.length === 0) return;

    const item0 = container.children[0] as HTMLElement | undefined;
    const itemN = container.children[randomProducts.length] as HTMLElement | undefined;
    const cycleWidth = item0 && itemN ? itemN.offsetLeft - item0.offsetLeft : 0;

    if (cycleWidth > 0) {
      if (container.scrollLeft >= cycleWidth * 3) {
        container.scrollLeft -= cycleWidth;
      } else if (container.scrollLeft < cycleWidth) {
        container.scrollLeft += cycleWidth;
      }
    }
    currentScrollRef.current = container.scrollLeft;
  };

  const handleAddToCart = (product: ProductCardItem) => {
    message.success(`Đã thêm "${product.name}" vào giỏ hàng`);
  };

  if (isLoading || !randomProducts || randomProducts.length === 0) {
    return null;
  }

  return (
    <section
      data-testid="related-products-carousel"
      className="space-y-6 pt-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-1">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            Khám Phá Thêm
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Sản Phẩm Apple Dành Cho Bạn
          </h2>
        </div>
        <p className="text-xs text-slate-500 max-w-sm">
          12 gợi ý ngẫu nhiên từ hệ sinh thái Apple chính hãng VN/A với giá ưu đãi tốt nhất.
        </p>
      </div>

      <div className="relative group/carousel">
        <button
          type="button"
          onClick={handleScrollLeft}
          data-testid="related-scroll-left"
          aria-label="Cuộn sang trái"
          className="absolute -left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-11 h-11 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-blue-600 shadow-md hover:shadow-lg border border-slate-200 transition-all cursor-pointer hover:scale-105"
        >
          <LeftOutlined className="text-xs" />
        </button>

        <div
          ref={scrollRef}
          data-testid="related-scroll-container"
          onScroll={handleScroll}
          onTouchStart={() => {
            isInteractingRef.current = true;
          }}
          onTouchEnd={() => {
            triggerPauseTemporarily();
          }}
          className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 px-1 no-scrollbar select-none"
        >
          {loopedProducts.map((prod, idx) => (
            <div
              key={`${prod.id}-${idx}`}
              className="w-72 sm:w-80 shrink-0"
            >
              <ProductCard
                product={prod}
                onAddToCart={handleAddToCart}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleScrollRight}
          data-testid="related-scroll-right"
          aria-label="Cuộn sang phải"
          className="absolute -right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-11 h-11 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-blue-600 shadow-md hover:shadow-lg border border-slate-200 transition-all cursor-pointer hover:scale-105"
        >
          <RightOutlined className="text-xs" />
        </button>
      </div>
    </section>
  );
};
