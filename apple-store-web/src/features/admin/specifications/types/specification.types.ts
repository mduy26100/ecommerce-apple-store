export interface ProductSpecificationDto {
  id: number;
  productId: number;
  productVariantId?: number | null;
  groupName?: string | null;
  name: string;
  value: string;
  unit?: string | null;
  displayOrder: number;
  createdOn?: string;
  lastModifiedOn?: string | null;
}

export interface CreateProductSpecificationRequest {
  productId: number;
  productVariantId?: number | null;
  groupName?: string | null;
  name: string;
  value: string;
  unit?: string | null;
  displayOrder?: number;
}

export interface UpdateProductSpecificationRequest {
  productVariantId?: number | null;
  groupName?: string | null;
  name: string;
  value: string;
  unit?: string | null;
  displayOrder: number;
}
