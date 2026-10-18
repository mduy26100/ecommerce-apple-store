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
  imageUrl: string;
  altText?: string;
  displayOrder?: number;
  isPrimary?: boolean;
}

export interface UpdateVariantImagePayload {
  imageUrl: string;
  altText?: string;
  displayOrder?: number;
  isPrimary?: boolean;
}
