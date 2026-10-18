/**
 * Role-Based Access Control (RBAC) constants.
 * Defines roles used across the application to prevent magic strings.
 */
export const USER_ROLES = {
  ADMIN: "Admin",
  SUPER_ADMIN: "SuperAdmin",
  OPERATOR: "Operator",
  SUPPORT: "Support",
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

/**
 * Mappings for JWT token claims to UserDetails keys.
 * Allows easy modification of claim keys without changing core logic.
 */
export const JWT_CLAIMS = {
  SUB: "sub",             // Maps to user id
  ROLE: "role",           // Maps to user role
  TENANT_ID: "tenant_id", // Maps to user tenantId
} as const;
