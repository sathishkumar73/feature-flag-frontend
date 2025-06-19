// Strict type for User matching Prisma schema
export type UserRole = 'USER' | 'ADMIN' | 'DEV' | 'PRODUCT_MANAGER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}
