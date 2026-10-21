export interface VariantImageItem {
  id: number;
  productVariantId: number;
  imageUrl: string;
  altText?: string | null;
  displayOrder: number;
  isPrimary: boolean;
  createdOn: string;
  lastModifiedOn?: string | null;
}

export interface CreateVariantImagePayload {
  productVariantId: number;
  imageUrl?: string;
  altText?: string;
  displayOrder?: number;
  isPrimary?: boolean;
  file?: File;
}

export interface CreateBatchVariantImagesPayload {
  productVariantId: number;
  files: File[];
  altText?: string;
}

export interface UpdateVariantImagePayload {
  imageUrl: string;
  altText?: string;
  displayOrder?: number;
  isPrimary?: boolean;
}
