import type { Coordinate } from "./coordinate";

export interface Zone {
  id: string;
  name: string;
  color: string;
  coordinates: Coordinate[];
}

export interface CreateZoneDto {
  name: string;
  color: string;
  coordinates: Coordinate[];
}

export interface CreateZoneFormDto {
  name: string;
  color: string;
}