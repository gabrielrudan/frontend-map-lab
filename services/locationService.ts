import { api } from "./api";
import type {
  CreateLocationDto,
  Location,
} from "@/types/location";

export const locationService = {
  async create(data: CreateLocationDto): Promise<Location> {
    const response = await api.post("/locations", data);

    return response.data;
  },

  async getAll(): Promise<Location[]> {
    const response = await api.get("/locations");

    return response.data;
  },
};