import type { MetaInfo } from "@core/models/api.model";

export interface ColorItem {
  id: number;
  name: string;
  code: string;
  hexCode?: string | null;
  isActive: boolean;
  createdOn: string;
  lastModifiedOn?: string | null;
}

export interface ColorPagedList extends Array<ColorItem> {
  meta?: MetaInfo;
}

export interface ColorPagedParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}

export interface CreateColorPayload {
  name: string;
  code: string;
  hexCode?: string;
  isActive?: boolean;
}

export interface UpdateColorPayload {
  name: string;
  code: string;
  hexCode?: string;
  isActive?: boolean;
}
