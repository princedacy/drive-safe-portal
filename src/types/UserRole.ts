
// Define user roles as constants to avoid string comparison issues
export const USER_ROLE = "USER";
export const ADMIN_ROLE = "ADMIN";
export const SUPER_ADMIN_ROLE = "SUPER_ADMIN";
export const ORGANIZATION_ADMIN_ROLE = "ORGANIZATION_ADMIN";

// Export a type with these specific values
export type UserRole = typeof USER_ROLE | typeof ADMIN_ROLE | typeof SUPER_ADMIN_ROLE | typeof ORGANIZATION_ADMIN_ROLE;
