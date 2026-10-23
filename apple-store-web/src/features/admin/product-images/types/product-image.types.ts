export interface ProductImageItem {
  id: number;
  productId: number;
  optionValueId?: number | null;
  optionValueName?: string | null;
  imageUrl: string;
  altText?: string | null;
  displayOrder: number;
  isPrimary: boolean;
  createdOn: string;
  lastModifiedOn?: string | null;
}

export interface CreateProductImagePayload {
  productId: number;
  optionValueId?: number | null;
  imageUrl?: string;
  altText?: string;
  displayOrder?: number;
  isPrimary?: boolean;
  file?: File;
}

export interface CreateBatchProductImagesPayload {
  productId: number;
  optionValueId?: number | null;
  files: File[];
  altText?: string;
}

export interface UpdateProductImagePayload {
  optionValueId?: number | null;
  imageUrl: string;
  altText?: string;
  displayOrder?: number;
  isPrimary?: boolean;
}
