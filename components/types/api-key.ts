import { User } from "./user";

export interface ApiKey {
  id: number;
  hashedKey: string;
  owner?: string | null;
  scopes?: string | null;
  lastUsedAt?: string | null;
  expiresAt?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  createdById?: string | null;
  updatedById?: string | null;
  createdBy?: User | null;
  updatedBy?: User | null;
}

export interface ApiKeyCreateRequest {
  owner?: string;
  scopes?: string;
  expiresAt?: string;
  description?: string;
  createdById?: string;
}

export interface ApiKeyUpdateRequest {
  owner?: string;
  scopes?: string;
  expiresAt?: string;
  description?: string;
  isActive?: boolean;
  updatedById?: string;
}