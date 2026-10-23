import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Breadcrumb, Pagination, Input, Select, Tag, Button, Empty, Spin, message } from "antd";
import {
  HomeOutlined,
  SearchOutlined,
  ReloadOutlined,
  SwapOutlined,
  DollarOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useCategories, useProductCardsPaged } from "@features/storefront/catalog";
import type { ProductCardItem } from "@features/storefront/catalog";
import ProductCard from "@features/storefront/catalog/components/ProductCard";

interface PriceRangeOption {
  label: string;
  min?: number;
  max?: number;
}

const PRICE_RANGES: PriceRangeOption[] = [
  { label: "Tất cả mức giá" },
  { label: "Dưới 10 triệu", max: 10000000 },
  { label: "10 - 25 triệu", min: 10000000, max: 25000000 },
  { label: "25 - 40 triệu", min: 25000000, max: 40000000 },
  { label: "Trên 40 triệu", min: 40000000 },
];

const SORT_OPTIONS = [
  { label: "Phổ biến & Mặc định", value: "default" },
  { label: "Mới nhất", value: "newest" },
  { label: "Giá tăng dần (Thấp - Cao)", value: "price_asc" },
  { label: "Giá giảm dần (Cao - Thấp)", value: "price_desc" },
  { label: "Tên A - Z", value: "name_asc" },
];

export const CatalogProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const categorySlugParam = searchParams.get("category") || "";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const searchParam = searchParams.get("q") || "";
  const sortParam = searchParams.get("sort") || "default";
  const priceIndexParam = parseInt(searchParams.get("price") || "0", 10);

  const [searchInput, setSearchInput] = useState(searchParam);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [categorySlugParam, pageParam]);

  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();

  const currentCategory = useMemo(() => {
    if (!categorySlugParam) return null;
    return categories.find((c) => c.slug.toLowerCase() === categorySlugParam.toLowerCase()) || null;
  }, [categories, categorySlugParam]);

  const selectedPriceRange = useMemo(() => {
    if (priceIndexParam > 0 && priceIndexParam < PRICE_RANGES.length) {
      return PRICE_RANGES[priceIndexParam];
    }
    return PRICE_RANGES[0];
  }, [priceIndexParam]);

  const queryParams = useMemo(() => {
    return {
      categorySlug: categorySlugParam || undefined,
      search: searchParam || undefined,
      sortBy: sortParam !== "default" ? sortParam : undefined,
      minPrice: selectedPriceRange.min,
      maxPrice: selectedPriceRange.max,
      pageNumber: pageParam,
      pageSize: 20,
    };
  }, [categorySlugParam, searchParam, sortParam, selectedPriceRange, pageParam]);

  const { data: pagedData, isLoading: isLoadingProducts, isFetching } = useProductCardsPaged(queryParams);

  const updateFilters = (updates: {
    category?: string | null;
    page?: number;
    q?: string;
    sort?: string;
    price?: number;
  }) => {
    const nextParams = new URLSearchParams(searchParams);

    if (updates.category !== undefined) {
      if (updates.category) {
        nextParams.set("category", updates.category);
      } else {
        nextParams.delete("category");
      }
      nextParams.set("page", "1");
    }

    if (updates.q !== undefined) {
      if (updates.q) {
        nextParams.set("q", updates.q);
      } else {
        nextParams.delete("q");
      }
      nextParams.set("page", "1");
    }

    if (updates.sort !== undefined) {
      if (updates.sort && updates.sort !== "default") {
        nextParams.set("sort", updates.sort);
      } else {
        nextParams.delete("sort");
      }
      nextParams.set("page", "1");
    }

    if (updates.price !== undefined) {
      if (updates.price > 0) {
        nextParams.set("price", updates.price.toString());
      } else {
        nextParams.delete("price");
      }
      nextParams.set("page", "1");
    }

    if (updates.page !== undefined) {
      nextParams.set("page", updates.page.toString());
    }

    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSearchParams(new URLSearchParams(categorySlugParam ? { category: categorySlugParam } : {}));
  };

  const handleAddToCart = (product: ProductCardItem) => {
    message.success(`Đã thêm "${product.name}" vào giỏ hàng thành công!`);
  };

  const hasActiveFilters = Boolean(searchParam || sortParam !== "default" || priceIndexParam > 0);

  const breadcrumbItems = useMemo(() => {
    const items = [
      {
        title: (
          <Link to="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
            <HomeOutlined />
            <span>Trang chủ</span>
          </Link>
        ),
      },
      {
        title: (
          <Link
            to="/products"
            onClick={() => updateFilters({ category: null })}
            className={`transition-colors ${!categorySlugParam ? "font-bold text-slate-900" : "text-slate-500 hover:text-blue-600"}`}
          >
            Sản phẩm
          </Link>
        ),
      },
    ];

    if (currentCategory) {
      items.push({
        title: <span className="font-bold text-slate-900">{currentCategory.name}</span>,
      });
    } else if (categorySlugParam) {
      items.push({
        title: <span className="font-bold text-slate-900 uppercase">{categorySlugParam}</span>,
      });
    }

    return items;
  }, [currentCategory, categorySlugParam]);

  const pageTitle = currentCategory?.name || "Tất cả sản phẩm Apple";
  const pageDescription =
    currentCategory?.description ||
    "Khám phá các sản phẩm Apple chính hãng VN/A với giá tốt nhất, bảo hành toàn diện 12 tháng tại Urban Stitch.";

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 select-none">
      <div className="bg-white border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <div data-testid="catalog-breadcrumbs" className="mb-4">
            <Breadcrumb items={breadcrumbItems} />
          </div>

          <div className="mb-4">
            <h1
              data-testid="catalog-category-title"
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 mb-2.5"
            >
              {pageTitle}
            </h1>
            <p
              data-testid="catalog-category-desc"
              className="text-sm sm:text-base text-slate-500 max-w-4xl leading-relaxed"
            >
              {pageDescription}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => updateFilters({ category: null })}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                !categorySlugParam
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              <AppstoreOutlined />
              <span>Tất cả</span>
            </button>

            {categories.map((cat) => {
              const isActive = cat.slug.toLowerCase() === categorySlugParam.toLowerCase();
              return (
                <button
                  key={cat.id}
                  type="button"
                  data-testid={`category-filter-tab-${cat.slug}`}
                  onClick={() => updateFilters({ category: cat.slug })}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xs shadow-blue-500/25"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div data-testid="filter-sort-bar" className="mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">
                Hiển thị{" "}
                <strong className="text-slate-900 font-bold" data-testid="catalog-current-count">
                  {pagedData?.itemCount ?? pagedData?.items.length ?? 0}
                </strong>{" "}
                trên tổng số{" "}
                <strong className="text-slate-900 font-bold" data-testid="catalog-total-count">
                  {pagedData?.totalCount ?? 0}
                </strong>{" "}
                sản phẩm
              </span>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              <div className="w-full sm:w-64">
                <Input
                  allowClear
                  prefix={<SearchOutlined className="text-slate-400 text-xs mr-1" />}
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onPressEnter={() => updateFilters({ q: searchInput })}
                  className="rounded-lg border-slate-200 bg-white text-xs shadow-2xs hover:border-blue-400 focus:border-blue-500 h-9"
                />
              </div>

              <div className="w-[calc(50%-5px)] sm:w-40">
                <Select
                  className="w-full text-xs h-9"
                  value={priceIndexParam}
                  onChange={(val) => updateFilters({ price: val })}
                  options={PRICE_RANGES.map((r, idx) => ({
                    value: idx,
                    label: r.label,
                  }))}
                  suffixIcon={<DollarOutlined className="text-slate-400 text-xs" />}
                />
              </div>

              <div className="w-[calc(50%-5px)] sm:w-44">
                <Select
                  className="w-full text-xs h-9"
                  value={sortParam}
                  onChange={(val) => updateFilters({ sort: val })}
                  options={SORT_OPTIONS}
                  suffixIcon={<SwapOutlined className="rotate-90 text-slate-400 text-xs" />}
                />
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 text-xxs font-medium uppercase tracking-wider">Đang lọc:</span>
              {selectedPriceRange.label !== "Tất cả mức giá" && (
                <Tag
                  color="blue"
                  closable
                  onClose={() => updateFilters({ price: 0 })}
                  className="border-none bg-blue-50 text-blue-700 font-medium text-xs rounded-md"
                >
                  {selectedPriceRange.label}
                </Tag>
              )}
              {searchParam && (
                <Tag
                  color="purple"
                  closable
                  onClose={() => {
                    setSearchInput("");
                    updateFilters({ q: "" });
                  }}
                  className="border-none bg-purple-50 text-purple-700 font-medium text-xs rounded-md"
                >
                  "{searchParam}"
                </Tag>
              )}
              {sortParam !== "default" && (
                <Tag
                  color="default"
                  closable
                  onClose={() => updateFilters({ sort: "default" })}
                  className="border-none bg-slate-100 text-slate-700 font-medium text-xs rounded-md"
                >
                  {SORT_OPTIONS.find((s) => s.value === sortParam)?.label}
                </Tag>
              )}
              <Button
                type="link"
                size="small"
                icon={<ReloadOutlined className="text-xs" />}
                onClick={handleResetFilters}
                className="text-xs text-blue-600 hover:text-blue-700 p-0 font-medium h-auto"
              >
                Đặt lại
              </Button>
            </div>
          )}
        </div>

        {isLoadingProducts || isLoadingCategories ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Spin size="large" />
            <span className="text-sm text-slate-500 font-medium">Đang tải danh sách sản phẩm Apple...</span>
          </div>
        ) : !pagedData || pagedData.items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center my-8 shadow-xs">
            <Empty
              description={
                <div className="flex flex-col items-center gap-2 mt-2">
                  <span className="text-base font-bold text-slate-800">Không tìm thấy sản phẩm nào phù hợp</span>
                  <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                    Vui lòng thử tìm kiếm với từ khóa khác, thay đổi mức giá lọc hoặc xóa bỏ bộ lọc để xem các sản phẩm sẵn hàng.
                  </p>
                </div>
              }
            >
              <Button
                type="primary"
                onClick={handleResetFilters}
                className="bg-blue-600 hover:bg-blue-700 h-10 px-6 rounded-xl font-semibold border-none mt-4"
              >
                Xem tất cả sản phẩm
              </Button>
            </Empty>
          </div>
        ) : (
          <div>
            <div
              data-testid="catalog-product-grid"
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-opacity duration-200 ${
                isFetching ? "opacity-60" : "opacity-100"
              }`}
            >
              {pagedData.items.map((product: ProductCardItem) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {pagedData.totalCount > 20 && (
              <div
                data-testid="catalog-pagination"
                className="mt-12 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl shadow-xs border"
              >
                <div className="text-xs text-slate-500 font-medium">
                  Trang <strong className="text-slate-900 font-bold">{pagedData.pageNumber}</strong> /{" "}
                  {pagedData.totalPages} (Trang này có{" "}
                  <strong className="text-slate-900 font-bold">
                    {pagedData.itemCount ?? pagedData.items.length}
                  </strong>{" "}
                  sản phẩm • Tổng cộng {pagedData.totalCount} sản phẩm, tối đa 20 sản phẩm / trang)
                </div>

                <Pagination
                  current={pagedData.pageNumber}
                  pageSize={20}
                  total={pagedData.totalCount}
                  onChange={(page) => updateFilters({ page })}
                  showSizeChanger={false}
                  className="text-xs"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogProductsPage;
