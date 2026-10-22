import { api } from "@core/api/axios.config";
import type { Product, Category } from "../types/catalog.types";

const MOCK_CATEGORIES: Category[] = [
  { id: "1", name: "iPhone", slug: "iphone", icon: "Smartphone", productCount: 24 },
  { id: "2", name: "MacBook", slug: "macbook", icon: "Laptop", productCount: 18 },
  { id: "3", name: "iPad", slug: "ipad", icon: "Tablet", productCount: 15 },
  { id: "4", name: "Apple Watch", slug: "watch", icon: "Watch", productCount: 12 },
  { id: "5", name: "Tai nghe & AirPods", slug: "airpods", icon: "Headphones", productCount: 9 },
  { id: "6", name: "Phụ kiện Apple", slug: "accessories", icon: "Cable", productCount: 30 },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "iPhone 16 Pro Max 256GB",
    slug: "iphone-16-pro-max-256gb",
    category: "iPhone",
    price: 34990000,
    originalPrice: 36990000,
    thumbnail: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=600",
    isNew: true,
    isHot: true,
    tag: "Titan Sa Mạc",
    description: "Chip A18 Pro, Nút Điều Khiển Camera hoàn toàn mới, màn hình Super Retina XDR 6.9 inch.",
  },
  {
    id: "p2",
    name: "MacBook Pro 14 M4 16GB / 512GB",
    slug: "macbook-pro-14-m4",
    category: "MacBook",
    price: 39990000,
    originalPrice: 41990000,
    thumbnail: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600",
    isNew: true,
    tag: "Đen Không Gian",
    description: "Chip Apple M4 thế hệ mới, màn hình Liquid Retina XDR 120Hz siêu sáng, thời lượng pin đến 24 giờ.",
  },
  {
    id: "p3",
    name: "iPad Pro M4 11 inch 256GB Wi-Fi",
    slug: "ipad-pro-m4-11-inch",
    category: "iPad",
    price: 28990000,
    originalPrice: 29990000,
    thumbnail: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=600",
    isNew: true,
    tag: "OLED Hai Lớp",
    description: "Độ mỏng kỷ lục 5.3mm, màn hình Ultra Retina XDR Tandem OLED đột phá cùng chip M4 mạnh mẽ.",
  },
  {
    id: "p4",
    name: "Apple Watch Series 10 Nhôm GPS 42mm",
    slug: "apple-watch-series-10",
    category: "Apple Watch",
    price: 10990000,
    thumbnail: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=600",
    isNew: true,
    isHot: true,
    tag: "Đen Bóng Jet Black",
    description: "Thiết kế mỏng nhất từ trước đến nay, màn hình OLED góc nhìn rộng, sạc nhanh 80% trong 30 phút.",
  },
  {
    id: "p5",
    name: "AirPods Pro (Thế hệ 2) USB-C",
    slug: "airpods-pro-2-usbc",
    category: "Tai nghe & AirPods",
    price: 6190000,
    originalPrice: 6590000,
    thumbnail: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=600",
    isHot: true,
    tag: "Chống ồn 2X",
    description: "Khử tiếng ồn chủ động mạnh gấp 2 lần, âm thanh thích ứng thông minh và cổng sạc USB-C hiện đại.",
  },
  {
    id: "p6",
    name: "Củ sạc đôi Apple 35W USB-C",
    slug: "cu-sac-doi-apple-35w",
    category: "Phụ kiện Apple",
    price: 1490000,
    thumbnail: "https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&q=80&w=600",
    tag: "Chính Hãng",
    description: "Cho phép sạc hai thiết bị cùng một lúc với công suất phân bổ thông minh.",
  },
];

export const catalogApi = {
  getCategories: async (): Promise<Category[]> => {
    try {
      const data = await api.get<Category[]>("/api/categories");
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return MOCK_CATEGORIES;
    } catch {
      return MOCK_CATEGORIES;
    }
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    return MOCK_PRODUCTS;
  },
};

