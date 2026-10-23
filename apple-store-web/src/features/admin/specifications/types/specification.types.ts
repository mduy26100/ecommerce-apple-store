export interface ProductSpecificationDto {
  id: number;
  groupId: number;
  groupName?: string | null;
  name: string;
  value: string;
  unit?: string | null;
  displayOrder: number;
  createdOn?: string;
  lastModifiedOn?: string | null;
}

export interface ProductSpecificationGroupDto {
  id: number;
  productId: number;
  name: string;
  displayOrder: number;
  specifications: ProductSpecificationDto[];
  createdOn?: string;
  lastModifiedOn?: string | null;
}

export interface CreateProductSpecificationGroupRequest {
  productId: number;
  name: string;
  displayOrder?: number;
}

export interface UpdateProductSpecificationGroupRequest {
  name: string;
  displayOrder?: number;
}

export interface CreateProductSpecificationRequest {
  groupId: number;
  name: string;
  value: string;
  unit?: string | null;
  displayOrder?: number;
}

export interface UpdateProductSpecificationRequest {
  name: string;
  value: string;
  unit?: string | null;
  displayOrder?: number;
}

export interface ReorderGroupRequest {
  orderedGroupIds: number[];
}

export interface ReorderSpecRequest {
  orderedSpecIds: number[];
}
