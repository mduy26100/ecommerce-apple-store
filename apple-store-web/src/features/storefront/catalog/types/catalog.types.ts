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
  id: string | number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  icon?: string;
  productCount?: number;
}

