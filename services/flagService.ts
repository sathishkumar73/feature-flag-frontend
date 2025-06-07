// services/flagService.ts
import { BaseService } from "./baseService";
import { FeatureFlag } from "@/components/types/flag";

interface FlagData {
  name: string;
  description: string;
  environment: string;
  enabled: boolean;
  rolloutPercentage?: number;
}

interface FlagsResponse {
  data: FeatureFlag[];
  meta: {
    totalPages: number;
  };
}

class FlagService extends BaseService {
  async fetchFlags(
    page = 1,
    limit = 10,
    environment = "all",
    sortOrder = "createdAt_desc"
  ): Promise<FlagsResponse> {
    const [sortField, sortDirection] = sortOrder.split("_");
    const params = {
      page,
      limit,
      ...(environment !== "all" && { environment }),
      sort: sortField,
      order: sortDirection,
    };
    return this.get("/flags", params);
  }

  async createFlag(data: FlagData) {
    return this.post("/flags", {
      ...data,
      rolloutPercentage: data.rolloutPercentage ?? 0,
    });
  }

  async updateFlag(id: string, data: FlagData) {
    return this.put(`/flags/${id}`, {
      ...data,
      rolloutPercentage: data.rolloutPercentage ?? 0,
    });
  }

  async deleteFlag(id: string) {
    return this.delete(`/flags/${id}`);
  }
}

export default new FlagService();
