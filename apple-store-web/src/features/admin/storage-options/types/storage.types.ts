import type { MetaInfo } from "@core/models/api.model";

export interface StorageOptionItem {
  id: number;
  name: string;
  capacityValue?: number | null;
  unit?: string | null;
  isActive: boolean;
  createdOn: string;
  lastModifiedOn?: string | null;
}

export interface StorageOptionPagedList extends Array<StorageOptionItem> {
  meta?: MetaInfo;
}

export interface StorageOptionPagedParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}

export interface CreateStorageOptionPayload {
  name: string;
  capacityValue?: number;
  unit?: string;
  isActive?: boolean;
}

export interface UpdateStorageOptionPayload {
  name: string;
  capacityValue?: number;
  unit?: string;
  isActive?: boolean;
}
