export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  isNew?: boolean;
  isHot?: boolean;
  tag?: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  productCount: number;
}
