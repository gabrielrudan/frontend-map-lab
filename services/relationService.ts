import { api } from "./api";

import type {
  CreateRelationDto,
  Relation,
} from "@/types/relation";

export const relationService = {
  async create(
    data: CreateRelationDto,
  ): Promise<Relation> {
    const response = await api.post(
      "/relations",
      data,
    );

    return response.data;
  },

  async getAll(): Promise<Relation[]> {
    const response =
      await api.get("/relations");

    return response.data;
  },
};