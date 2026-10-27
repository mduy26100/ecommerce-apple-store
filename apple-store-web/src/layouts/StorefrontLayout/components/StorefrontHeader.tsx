import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Button, Badge, Drawer, Dropdown, Input } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  MenuOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  LogoutOutlined,
  EllipsisOutlined,
  DownOutlined,
  UpOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useAuthStore, useLogout, AUTH_STATUS } from "@features/auth";
import { USER_ROLES } from "@core/constants/role.constants";
import { AppleLogo } from "@shared/components/icons";
import { useCategories, useProductSearch } from "@features/storefront/catalog";
import { useCart } from "@features/storefront/cart";

export const StorefrontHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [imgErrorMap, setImgErrorMap] = useState<Record<number, boolean>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<any>(null);
  const searchButtonRef = useRef<any>(null);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const { mutate: logout } = useLogout();
  const isSuperAdmin = user?.role === USER_ROLES.SUPER_ADMIN;
  const { data: categories } = useCategories();
  const { data: cart } = useCart();
  const { data: searchResults, isLoading: isSearching } = useProductSearch(searchQuery);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const availableCartCount = useMemo(() => {
    if (!cart?.items || cart.items.length === 0) return 0;
    return cart.items
      .filter((item) => item.isAvailable && item.quantityInStock > 0)
      .reduce((sum, item) => sum + item.quantity, 0);
  }, [cart?.items]);

  const activeCategorySlug = useMemo(() => {
    if (location.pathname === "/products") {
      return (searchParams.get("category") || "").toLowerCase();
    }
    return "";
  }, [location.pathname, searchParams]);

  const { mainCategories, overflowCategories } = useMemo(() => {
    const list = categories || [];
    if (list.length <= 5) {
      return { mainCategories: list, overflowCategories: [] };
    }
    return {
      mainCategories: list.slice(0, 5),
      overflowCategories: list.slice(5),
    };
  }, [categories]);

  const isOverflowActive = useMemo(() => {
    if (!activeCategorySlug) return false;
    return overflowCategories.some((cat) => cat.slug.toLowerCase() === activeCategorySlug);
  }, [overflowCategories, activeCategorySlug]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery("");
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth < 768) {
        return;
      }
      const target = event.target as Node;
      const isInsideSearchContainer = searchContainerRef.current?.contains(target);
      const isInsideSearchButton = searchButtonRef.current?.contains(target);
      if (!isInsideSearchContainer && !isInsideSearchButton) {
        handleCloseSearch();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCloseSearch();
      }
    };
    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSearchOpen, handleCloseSearch]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const trimmed = searchQuery.trim();
      if (trimmed) {
        navigate(`/products?q=${encodeURIComponent(trimmed)}&page=1`);
        handleCloseSearch();
      }
    }
  };

  const handleSelectProduct = (slug: string) => {
    navigate(`/products/${slug}`);
    handleCloseSearch();
  };

  const handleViewAllResults = () => {
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/products?q=${encodeURIComponent(trimmed)}&page=1`);
    } else {
      navigate("/products");
    }
    handleCloseSearch();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleProfileClick = () => {
    if (isSuperAdmin) {
      navigate("/admin/dashboard");
    } else {
      navigate("/profile");
    }
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === "profile") {
      navigate("/profile");
    } else if (key === "orders") {
      navigate("/orders");
    } else if (key === "logout") {
      logout();
    }
  };

  const userMenuItems = useMemo(
    () => [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: "Thông tin tài khoản",
      },
      {
        key: "orders",
        icon: <ShoppingOutlined />,
        label: "Đơn hàng của tôi",
      },
      {
        type: "divider" as const,
      },
      {
        key: "logout",
        icon: <LogoutOutlined className="text-red-500" />,
        label: <span className="text-red-500 font-medium">Đăng xuất</span>,
      },
    ],
    []
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-slate-200/70 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <AppleLogo size={32} />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-extrabold tracking-tight text-base sm:text-lg leading-tight bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Urban Stitch
            </span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase -mt-0.5">
              Chính Hãng VN
            </span>
          </div>
        </Link>

        {isSearchOpen ? (
          <div ref={searchContainerRef} className="hidden md:flex items-center h-full flex-1 max-w-4xl mx-2 md:mx-4 relative animate-in fade-in duration-200">
            <div className="w-full">
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Tìm kiếm iPhone, Mac, iPad, Phụ kiện... (tối thiểu 3 ký tự)"
                prefix={
                  isSearching ? (
                    <LoadingOutlined className="text-blue-600 text-sm animate-spin mr-1" />
                  ) : (
                    <SearchOutlined className="text-slate-400 text-sm mr-1" />
                  )
                }
                suffix={
                  searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      aria-label="Xóa từ khóa"
                    >
                      <CloseCircleOutlined className="text-xs" />
                    </button>
                  ) : null
                }
                className="h-8.5 rounded-full bg-slate-100 hover:bg-slate-100 focus:bg-white border-slate-200 focus:border-blue-500 text-xs sm:text-sm px-4 shadow-inner"
                allowClear={false}
              />
            </div>

            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
              {searchQuery.trim().length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Nhập tên sản phẩm để tìm kiếm (tối thiểu 3 ký tự)...
                </div>
              ) : searchQuery.trim().length < 3 ? (
                <div className="p-4 text-center text-xs text-amber-600 bg-amber-50/50">
                  Vui lòng nhập tối thiểu 3 ký tự để tìm kiếm sản phẩm...
                </div>
              ) : isSearching ? (
                <div className="p-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <LoadingOutlined className="text-blue-600 text-base animate-spin" />
                  <span>Đang tìm kiếm sản phẩm...</span>
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                <div>
                  <div className="px-4 py-2 bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100">
                    <span>Kết quả tìm kiếm ({searchResults.length})</span>
                    <span className="text-[10px] text-slate-400 font-normal">Nhấn Enter để xem tất cả</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-slate-50">
                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectProduct(item.slug)}
                        className="flex items-center gap-3 p-3 hover:bg-blue-50/50 transition-colors cursor-pointer group"
                      >
                        <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                          {item.imageUrl && !imgErrorMap[item.id] ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                              onError={() => setImgErrorMap((prev) => ({ ...prev, [item.id]: true }))}
                            />
                          ) : (
                            <AppleLogo size={22} className="text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            {item.categoryName && (
                              <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                {item.categoryName}
                              </span>
                            )}
                            {item.chipName && (
                              <span className="text-[11px] font-medium text-slate-400">
                                {item.chipName}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs sm:text-sm font-bold text-blue-600">
                            {formatCurrency(item.price)}
                          </div>
                          {item.compareAtPrice && item.compareAtPrice > item.price ? (
                            <div className="text-[11px] text-slate-400 line-through">
                              {formatCurrency(item.compareAtPrice)}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    data-testid="header-search-view-all"
                    onClick={handleViewAllResults}
                    className="p-3 bg-slate-50 hover:bg-slate-100 text-center text-xs font-semibold text-blue-600 cursor-pointer border-t border-slate-100 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Xem tất cả kết quả cho &ldquo;{searchQuery}&rdquo;</span>
                    <ArrowRightOutlined className="text-[10px]" />
                  </div>
                </div>
              ) : (
                <div className="py-8 px-4 text-center flex flex-col items-center justify-center gap-2">
                  <AppleLogo size={28} className="text-slate-300 opacity-60" />
                  <p className="text-xs sm:text-sm font-medium text-slate-600">
                    Không tìm thấy sản phẩm nào khớp với &ldquo;{searchQuery}&rdquo;
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Thử tìm kiếm với từ khóa khác như iPhone, iPad, Mac, Phụ kiện...
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <nav className="hidden md:flex items-center gap-1 lg:gap-2.5 xl:gap-4 shrink min-w-0">
            {mainCategories.map((cat) => {
              const isActive = activeCategorySlug === cat.slug.toLowerCase();
              return (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  title={cat.name}
                  data-testid={`header-nav-category-${cat.slug}`}
                  data-active={isActive ? "true" : undefined}
                  className={`text-xs lg:text-sm transition-all duration-150 truncate max-w-20 md:max-w-23.75 lg:max-w-28.75 xl:max-w-35 whitespace-nowrap block px-2.5 py-1.5 rounded-full ${
                    isActive
                      ? "text-blue-600 font-bold bg-blue-50/90 shadow-2xs"
                      : "text-slate-600 font-medium hover:text-blue-600 hover:bg-slate-50"
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}

            {overflowCategories.length > 0 && (
              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer ${
                    isOverflowActive
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : isDropdownOpen
                      ? "bg-slate-100 text-blue-600"
                      : "text-slate-600 hover:text-blue-600 hover:bg-slate-100"
                  }`}
                  aria-label="Xem thêm danh mục"
                  aria-expanded={isDropdownOpen}
                >
                  <EllipsisOutlined className="text-lg" />
                  {isOverflowActive && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-600" />
                  )}
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 max-h-60 overflow-y-auto custom-scrollbar bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Danh mục khác
                    </div>
                    {overflowCategories.map((cat) => {
                      const isActive = activeCategorySlug === cat.slug.toLowerCase();
                      return (
                        <Link
                          key={cat.id}
                          to={`/products?category=${cat.slug}`}
                          title={cat.name}
                          data-testid={`header-nav-category-${cat.slug}`}
                          data-active={isActive ? "true" : undefined}
                          onClick={() => setIsDropdownOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg mx-1 transition-colors ${
                            isActive
                              ? "bg-blue-50 text-blue-600 font-bold"
                              : "font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                          }`}
                        >
                          <span className="truncate max-w-42.5 whitespace-nowrap">{cat.name}</span>
                          <span className={`ml-1 shrink-0 ${isActive ? "text-blue-600 font-bold" : "text-slate-300"}`}>
                            &rsaquo;
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </nav>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
          {isSuperAdmin && (
            <Link
              to="/admin/dashboard"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors duration-200 shrink-0"
            >
              <SafetyCertificateOutlined className="text-sm shrink-0" />
              <span className="truncate whitespace-nowrap">Trang Quản trị</span>
            </Link>
          )}

          <Button
            ref={searchButtonRef}
            type="text"
            icon={<SearchOutlined />}
            onClick={() => {
              if (isSearchOpen) {
                handleCloseSearch();
              } else {
                setIsSearchOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }
            }}
            className={`flex items-center justify-center w-9 h-9 rounded-lg text-base shrink-0 transition-colors ${
              isSearchOpen ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600 hover:bg-slate-100"
            }`}
            aria-label="Tìm kiếm"
          />

          {!user && (
            <Link to="/order-lookup" aria-label="Tra cứu đơn hàng" title="Tra cứu đơn hàng">
              <Button
                type="text"
                icon={<FileTextOutlined />}
                className="flex items-center justify-center w-9 h-9 text-slate-600 hover:bg-slate-100 rounded-lg text-lg shrink-0 cursor-pointer"
                aria-label="Tra cứu đơn hàng"
              />
            </Link>
          )}

          <Link to="/cart" aria-label="Giỏ hàng" data-testid="header-cart-link">
            <Badge count={availableCartCount} showZero={false} size="small" offset={[-2, 2]}>
              <Button
                type="text"
                icon={<ShoppingCartOutlined />}
                className="flex items-center justify-center w-9 h-9 text-slate-600 hover:bg-slate-100 rounded-lg text-lg shrink-0 cursor-pointer"
                aria-label="Giỏ hàng"
              />
            </Badge>
          </Link>

          <div className="hidden md:flex items-center shrink-0">
            {status === AUTH_STATUS.CHECKING_AUTH ? (
              <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse shrink-0" />
            ) : user ? (
              isSuperAdmin ? (
                <div
                  onClick={handleProfileClick}
                  className="flex items-center gap-2 pl-2 py-1 pr-2 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors shrink-0"
                  title="Cổng Quản trị"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center border border-slate-700 shrink-0">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : "A"}
                  </div>
                  <span className="hidden xl:inline text-xs font-semibold text-slate-800 max-w-30 truncate whitespace-nowrap">
                    {user.fullName || "Quản trị viên"}
                  </span>
                </div>
              ) : (
                <Dropdown
                  menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
                  placement="bottomRight"
                  trigger={["click"]}
                  arrow
                >
                  <div className="flex items-center gap-2 pl-2 py-1 pr-2 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center border border-blue-200 shrink-0">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : "A"}
                    </div>
                    <span className="hidden xl:inline text-xs font-semibold text-slate-800 max-w-30 truncate whitespace-nowrap">
                      {user.fullName || "Tài khoản"}
                    </span>
                  </div>
                </Dropdown>
              )
            ) : (
              <Button
                type="primary"
                icon={<UserOutlined />}
                onClick={() => navigate("/login")}
                className="bg-blue-600 hover:bg-blue-700 h-9 rounded-xl text-xs font-semibold border-none shadow-xs shrink-0"
              >
                Đăng nhập
              </Button>
            )}
          </div>

          <div className="block md:hidden">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileOpen(true)}
              className="flex items-center justify-center w-9 h-9 text-slate-700 hover:bg-slate-100 rounded-lg text-lg"
              aria-label="Menu"
            />
          </div>
        </div>
      </div>

      <Drawer
        title={
          <div className="flex items-center gap-2">
            <AppleLogo size={22} />
            <span className="font-extrabold text-base bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">Urban Stitch</span>
          </div>
        }
        placement="right"
        onClose={() => setMobileOpen(false)}
        open={mobileOpen}
        destroyOnClose
        rootClassName="md:!hidden"
        styles={{ body: { padding: 0 } }}
      >
        <div className="flex flex-col p-4 gap-2">
          {isSuperAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between p-3 bg-slate-900 text-white rounded-xl font-semibold text-xs mb-3 shadow-sm"
            >
              <span className="flex items-center gap-2">
                <SafetyCertificateOutlined className="text-base" />
                Truy cập Cổng Quản trị (Admin)
              </span>
              <span>&rarr;</span>
            </Link>
          )}

          <div className="px-1 mb-2">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setIsSearchOpen(true);
              }}
              className="w-full flex items-center gap-2 px-3.5 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 text-xs border border-slate-200 transition-colors text-left cursor-pointer"
            >
              <SearchOutlined className="text-slate-400 text-sm" />
              <span>Tìm kiếm iPhone, Mac, iPad...</span>
            </button>
          </div>

          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
            Danh mục mua sắm
          </div>

          <div className="flex flex-col">
            {mainCategories.map((cat) => {
              const isActive = activeCategorySlug === cat.slug.toLowerCase();
              return (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  title={cat.name}
                  data-testid={`mobile-nav-category-${cat.slug}`}
                  data-active={isActive ? "true" : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600"
                      : "font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  }`}
                >
                  <span className="truncate max-w-60 whitespace-nowrap">{cat.name}</span>
                  <span className={`ml-1 shrink-0 ${isActive ? "text-blue-600 font-bold" : "text-slate-300"}`}>
                    &rsaquo;
                  </span>
                </Link>
              );
            })}

            {overflowCategories.length > 0 && (
              <div className="mt-1">
                <button
                  type="button"
                  onClick={() => setIsMobileMoreOpen((prev) => !prev)}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <span>{isMobileMoreOpen ? "Thu gọn bớt danh mục" : `Xem thêm (${overflowCategories.length} danh mục)`}</span>
                  {isMobileMoreOpen ? <UpOutlined className="text-[10px]" /> : <DownOutlined className="text-[10px]" />}
                </button>

                {isMobileMoreOpen && (
                  <div className="max-h-60 overflow-y-auto custom-scrollbar flex flex-col pl-2 border-l-2 border-slate-100 ml-3 mt-1">
                    {overflowCategories.map((cat) => {
                      const isActive = activeCategorySlug === cat.slug.toLowerCase();
                      return (
                        <Link
                          key={cat.id}
                          to={`/products?category=${cat.slug}`}
                          title={cat.name}
                          data-testid={`mobile-nav-category-${cat.slug}`}
                          data-active={isActive ? "true" : undefined}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActive
                              ? "bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600"
                              : "font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                          }`}
                        >
                          <span className="truncate max-w-55 whitespace-nowrap">{cat.name}</span>
                          <span className={`ml-1 shrink-0 ${isActive ? "text-blue-600 font-bold" : "text-slate-300"}`}>
                            &rsaquo;
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 my-3 pt-3">
            <Link
              to="/cart"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs mb-3 border border-blue-200/60"
            >
              <div className="flex items-center gap-2">
                <ShoppingCartOutlined className="text-base" />
                <span>Giỏ hàng của bạn</span>
              </div>
              <Badge count={availableCartCount} showZero={false} size="small" />
            </Link>

            {user ? (
              <div className="flex flex-col gap-2">
                <Button
                  type="default"
                  onClick={() => {
                    setMobileOpen(false);
                    handleProfileClick();
                  }}
                  className="w-full text-xs font-semibold h-10 rounded-xl flex items-center justify-center gap-2"
                >
                  <UserOutlined />
                  {isSuperAdmin ? "Cổng quản trị" : "Thông tin tài khoản"} ({user.fullName || "Tài khoản"})
                </Button>
                <Button
                  danger
                  icon={<LogoutOutlined />}
                  onClick={() => {
                    setMobileOpen(false);
                    if (isSuperAdmin) {
                      logout(undefined, {
                        onSettled: () => {
                          navigate("/admin/auth/login");
                        },
                      });
                    } else {
                      logout();
                    }
                  }}
                  className="w-full text-xs font-semibold h-10 rounded-xl"
                >
                  Đăng xuất
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  type="primary"
                  icon={<UserOutlined />}
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/login");
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-xs font-semibold h-10 rounded-xl border-none shadow-sm flex items-center justify-center"
                >
                  Đăng nhập tài khoản
                </Button>
                <Button
                  type="default"
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/register");
                  }}
                  className="w-full text-xs font-semibold h-10 rounded-xl border-slate-200 text-slate-700"
                >
                  Tạo tài khoản mới
                </Button>
              </div>
            )}
          </div>
        </div>
      </Drawer>

      {isSearchOpen && typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-white flex flex-col md:hidden animate-in fade-in duration-150">
            <div className="h-16 px-4 border-b border-slate-100 flex items-center gap-2.5 bg-white shrink-0 shadow-2xs">
              <button
                type="button"
                onClick={handleCloseSearch}
                className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer shrink-0"
                aria-label="Quay lại"
              >
                <ArrowLeftOutlined className="text-lg" />
              </button>

              <div className="flex-1 min-w-0">
                <Input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Tìm kiếm iPhone, Mac, iPad..."
                  prefix={
                    isSearching ? (
                      <LoadingOutlined className="text-blue-600 text-sm animate-spin mr-1" />
                    ) : (
                      <SearchOutlined className="text-slate-400 text-sm mr-1" />
                    )
                  }
                  suffix={
                    searchQuery ? (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                        aria-label="Xóa từ khóa"
                      >
                        <CloseCircleOutlined className="text-xs" />
                      </button>
                    ) : null
                  }
                  className="h-10 rounded-full bg-slate-100 hover:bg-slate-100 focus:bg-white border-slate-200 focus:border-blue-500 text-sm px-3.5 shadow-inner"
                  allowClear={false}
                />
              </div>

              <button
                type="button"
                onClick={handleCloseSearch}
                className="text-blue-600 text-sm font-semibold px-2 py-1 hover:text-blue-700 transition-colors cursor-pointer shrink-0"
              >
                Hủy
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-2 bg-white">
              {searchQuery.trim().length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                  <SearchOutlined className="text-2xl text-slate-300" />
                  <span>Nhập tên sản phẩm để tìm kiếm (tối thiểu 3 ký tự)...</span>
                </div>
              ) : searchQuery.trim().length < 3 ? (
                <div className="py-8 text-center text-xs text-amber-600 bg-amber-50/60 rounded-xl my-4 px-4">
                  Vui lòng nhập tối thiểu 3 ký tự để tìm kiếm sản phẩm...
                </div>
              ) : isSearching ? (
                <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                  <LoadingOutlined className="text-blue-600 text-xl animate-spin" />
                  <span>Đang tìm kiếm sản phẩm...</span>
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                <div>
                  <div className="py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 mb-1">
                    <span>Kết quả tìm kiếm ({searchResults.length})</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectProduct(item.slug);
                        }}
                        className="flex items-center gap-3.5 py-3 hover:bg-slate-50 active:bg-blue-50/50 transition-colors cursor-pointer"
                      >
                        <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                          {item.imageUrl && !imgErrorMap[item.id] ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-contain p-1"
                              onError={() => setImgErrorMap((prev) => ({ ...prev, [item.id]: true }))}
                            />
                          ) : (
                            <AppleLogo size={26} className="text-slate-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 pr-1">
                          <h4 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug">
                            {item.name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {item.categoryName && (
                              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                {item.categoryName}
                              </span>
                            )}
                            {item.chipName && (
                              <span className="text-[10px] font-medium text-slate-400">
                                {item.chipName}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0 text-right min-w-20 pl-2">
                          <div className="text-sm font-bold text-blue-600 leading-tight">
                            {formatCurrency(item.price)}
                          </div>
                          {item.compareAtPrice && item.compareAtPrice > item.price ? (
                            <div className="text-xs text-slate-400 line-through leading-tight mt-0.5">
                              {formatCurrency(item.compareAtPrice)}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-14 px-4 text-center flex flex-col items-center justify-center gap-2">
                  <AppleLogo size={36} className="text-slate-300 opacity-60" />
                  <p className="text-sm font-medium text-slate-600">
                    Không tìm thấy sản phẩm nào khớp với &ldquo;{searchQuery}&rdquo;
                  </p>
                  <p className="text-xs text-slate-400">
                    Thử tìm kiếm với từ khóa khác như iPhone, iPad, Mac, Phụ kiện...
                  </p>
                </div>
              )}
            </div>

            {searchResults && searchResults.length > 0 && (
              <div className="p-3 bg-white border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  data-testid="mobile-search-view-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewAllResults();
                  }}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <span>Xem tất cả kết quả cho &ldquo;{searchQuery}&rdquo;</span>
                  <ArrowRightOutlined className="text-xs" />
                </button>
              </div>
            )}
          </div>,
          document.body
        )}
    </header>
  );
};

export default StorefrontHeader;
