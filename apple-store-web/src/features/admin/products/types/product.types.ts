import type { MetaInfo } from "@core/models/api.model";
import type { ProductVariantItem } from "../../variants/types/variant.types";

export interface ProductItem {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  slug: string;
  modelCode?: string | null;
  shortDescription?: string | null;
  warrantyMonths?: number | null;
  isActive: boolean;
  variantsCount: number;
  minPrice?: number | null;
  maxPrice?: number | null;
  createdOn: string;
  lastModifiedOn?: string | null;
}

export interface ProductDetailItem {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  slug: string;
  modelCode?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  warrantyMonths?: number | null;
  isActive: boolean;
  variants?: ProductVariantItem[];
  createdOn: string;
  lastModifiedOn?: string | null;
}

export interface ProductPagedList extends Array<ProductItem> {
  meta?: MetaInfo;
}

export interface ProductPagedParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  categoryId?: number;
  isActive?: boolean;
}

export interface CreateProductPayload {
  categoryId: number;
  name: string;
  slug: string;
  modelCode?: string;
  shortDescription?: string;
  description?: string;
  warrantyMonths?: number;
  isActive?: boolean;
}

export interface UpdateProductPayload {
  categoryId: number;
  name: string;
  slug: string;
  modelCode?: string;
  shortDescription?: string;
  description?: string;
  warrantyMonths?: number;
  isActive?: boolean;
}
