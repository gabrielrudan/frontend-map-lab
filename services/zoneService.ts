import { api } from "./api";

import type {
  CreateZoneDto,
  Zone,
} from "@/types/zone";

export const zoneService = {
  async create(data: CreateZoneDto): Promise<Zone> {
    const response = await api.post("/zones", data);

    return response.data;
  },

  async getAll(): Promise<Zone[]> {
    const response = await api.get("/zones");

    return response.data;
  },
};