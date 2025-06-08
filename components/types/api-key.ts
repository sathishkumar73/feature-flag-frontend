export interface ApiKey {
    id: string;
    partialKey: string;
    fullKey?: string; // fullKey should only be present temporarily, e.g., right after creation or explicit reveal
    createdAt: string; // ISO string
    revokedAt?: string; // ISO string
    status: "active" | "revoked";
  }