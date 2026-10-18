import type { MetaInfo } from "@core/models/api.model";

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdOn: string;
  lastModifiedOn?: string | null;
}

export interface CategoryPagedList extends Array<CategoryItem> {
  meta?: MetaInfo;
}

export interface CategoryPagedParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}

export interface CreateCategoryPayload {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryPayload {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
}
