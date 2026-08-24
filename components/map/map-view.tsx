"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";

import CreateLocationModal from "@/components/location/create-location-modal";
import LocationDetailsModal from "@/components/location/location-details-modal";
import { locationService } from "@/services/locationService";
import type {
  CreateLocationDto,
  Location,
} from "@/types/location";

import "./lib/mapWorker";

type Position = {
  lat: number;
  lng: number;
};

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [locations, setLocations] = useState<Location[]>([]);

  const [selectedPosition, setSelectedPosition] =
    useState<Position | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState(false);

  const [selectedLocation, setSelectedLocation] =
    useState<Location | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] =
    useState(false);

  async function loadLocations() {
    try {
      const data = await locationService.getAll();

      setLocations(data);
    } catch (error) {
      console.error("Erro ao carregar locais:", error);
    }
  }

  // Carrega os locais já persistidos na API simulada
  useEffect(() => {
    let cancelled = false;

    locationService
      .getAll()
      .then((data) => {
        if (!cancelled) {
          setLocations(data);
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar locais:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Criação do mapa
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,

      style: {
        version: 8,

        sources: {
          osm: {
            type: "raster",
            tiles: [
              "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },

        layers: [
          {
            id: "dark-background",
            type: "background",
            paint: {
              "background-color": "#080d16",
            },
          },

          {
            id: "osm",
            type: "raster",
            source: "osm",
            paint: {
              "raster-brightness-min": 0.02,
              "raster-brightness-max": 0.42,
              "raster-contrast": 0.35,
              "raster-saturation": -0.65,
              "raster-hue-rotate": 185,
            },
          },
        ],
      },

      center: [-38.5267, -3.7319],
      zoom: 11,
    });

    mapRef.current = map;

    map.addControl(
      new maplibregl.NavigationControl(),
      "bottom-left",
    );

    map.on("click", (event) => {
      const { lat, lng } = event.lngLat;

      setSelectedPosition({ lat, lng });
      setIsCreateModalOpen(true);
    });

    map.on("error", (event) => {
      console.error("Erro no MapLibre:", event.error);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Atualiza os markers sempre que locations mudar
  useEffect(() => {
    const map = mapRef.current;

    if (!map) return;

    markersRef.current.forEach((marker) => {
      marker.remove();
    });

    markersRef.current = locations.map((location) => {
      const markerElement = document.createElement("button");

      markerElement.type = "button";
      markerElement.className = "map-pin";
      markerElement.title = location.name;

      markerElement.setAttribute(
        "aria-label",
        `Abrir detalhes de ${location.name}`,
      );

      markerElement.addEventListener("click", (event) => {
        event.stopPropagation();

        setSelectedLocation(location);
        setIsDetailsModalOpen(true);
      });

      return new maplibregl.Marker({
        element: markerElement,
        anchor: "bottom",
      })
        .setLngLat([location.lng, location.lat])
        .addTo(map);
    });
  }, [locations]);

  async function handleLocationCreated(
    location: CreateLocationDto,
  ) {
    try {
      await locationService.create(location);

      await loadLocations();

      setSelectedPosition(null);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Erro ao cadastrar local:", error);
    }
  }

  return (
    <>
      <div
        ref={mapContainer}
        className="h-screen w-full"
      />

      <CreateLocationModal
        open={isCreateModalOpen}
        position={selectedPosition}
        onCancel={() => {
          setSelectedPosition(null);
          setIsCreateModalOpen(false);
        }}
        onLocationCreated={handleLocationCreated}
      />

      <LocationDetailsModal
        open={isDetailsModalOpen}
        location={selectedLocation}
        onCancel={() => {
          setSelectedLocation(null);
          setIsDetailsModalOpen(false);
        }}
      />
    </>
  );
}