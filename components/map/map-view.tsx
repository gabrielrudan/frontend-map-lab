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

  // Controle da ferramenta de linha
  const [isLineMode, setIsLineMode] = useState(false);

  const [selectedLineLocationIds, setSelectedLineLocationIds] =
    useState<string[]>([]);

  const [isMapLoaded, setIsMapLoaded] = useState(false);

  async function loadLocations() {
    try {
      const data = await locationService.getAll();
      setLocations(data);
    } catch (error) {
      console.error("Erro ao carregar locais:", error);
    }
  }

  // Carrega locais persistidos
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

    map.on("load", () => {
      // Fonte GeoJSON inicialmente vazia
      map.addSource("selected-line", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      // Camada que desenhará a Polyline
      map.addLayer({
        id: "selected-line-layer",
        type: "line",
        source: "selected-line",

        layout: {
          "line-cap": "round",
          "line-join": "round",
        },

        paint: {
          "line-color": "#3b82f6",
          "line-width": 4,
          "line-opacity": 0.9,
        },
      });

      setIsMapLoaded(true);
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

  // Clique comum no mapa:
  // só cadastra local quando NÃO estivermos traçando uma linha
  useEffect(() => {
    const map = mapRef.current;

    if (!map) return;

    function handleMapClick(event: maplibregl.MapMouseEvent) {
      if (isLineMode) return;

      const { lat, lng } = event.lngLat;

      setSelectedPosition({ lat, lng });
      setIsCreateModalOpen(true);
    }

    map.on("click", handleMapClick);

    return () => {
      map.off("click", handleMapClick);
    };
  }, [isLineMode]);

  // Criação / atualização dos pins
  useEffect(() => {
    const map = mapRef.current;

    if (!map) return;

    markersRef.current.forEach((marker) => {
      marker.remove();
    });

    markersRef.current = locations.map((location) => {
      const markerElement = document.createElement("button");

      markerElement.type = "button";

      const isSelected =
        selectedLineLocationIds.includes(location.id);

      markerElement.className = isSelected
        ? "map-pin map-pin-selected"
        : "map-pin";

      markerElement.title = isLineMode
        ? `Selecionar ${location.name}`
        : location.name;

      markerElement.setAttribute(
        "aria-label",
        isLineMode
          ? `Selecionar ${location.name} para traçar linha`
          : `Abrir detalhes de ${location.name}`,
      );

      markerElement.addEventListener("click", (event) => {
        event.stopPropagation();

        // Modo de desenho de linha
        if (isLineMode) {
          setSelectedLineLocationIds((previous) => {
            // Não seleciona o mesmo ponto duas vezes
            if (previous.includes(location.id)) {
              return previous;
            }

            // Se uma linha já estava completa,
            // clicar em outro ponto inicia uma nova seleção
            if (previous.length >= 2) {
              return [location.id];
            }

            return [...previous, location.id];
          });

          return;
        }

        // Modo normal: abre detalhes
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
  }, [
    locations,
    isLineMode,
    selectedLineLocationIds,
  ]);

  // Desenha a linha entre os dois locais selecionados
  useEffect(() => {
    if (!isMapLoaded) return;

    const map = mapRef.current;

    if (!map) return;

    const source = map.getSource(
      "selected-line",
    ) as maplibregl.GeoJSONSource | undefined;

    if (!source) return;

    if (selectedLineLocationIds.length !== 2) {
      source.setData({
        type: "FeatureCollection",
        features: [],
      });

      return;
    }

    const firstLocation = locations.find(
      (location) =>
        location.id === selectedLineLocationIds[0],
    );

    const secondLocation = locations.find(
      (location) =>
        location.id === selectedLineLocationIds[1],
    );

    if (!firstLocation || !secondLocation) return;

    source.setData({
      type: "FeatureCollection",

      features: [
        {
          type: "Feature",
          properties: {},

          geometry: {
            type: "LineString",

            coordinates: [
              [
                firstLocation.lng,
                firstLocation.lat,
              ],
              [
                secondLocation.lng,
                secondLocation.lat,
              ],
            ],
          },
        },
      ],
    });
  }, [
    isMapLoaded,
    selectedLineLocationIds,
    locations,
  ]);

  async function handleLocationCreated(
    location: CreateLocationDto,
  ) {
    try {
      await locationService.create(location);

      await loadLocations();

      setSelectedPosition(null);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error(
        "Erro ao cadastrar local:",
        error,
      );
    }
  }

  function toggleLineMode() {
    setIsLineMode((previous) => !previous);
    setSelectedLineLocationIds([]);
  }

  function clearLine() {
    setSelectedLineLocationIds([]);
  }

  return (
    <div className="relative">
      <div
        ref={mapContainer}
        className="h-[calc(100vh-3.5rem)] w-full"
      />

      {/* Toolbar simples do mapa */}
      <div className="absolute left-4 top-4 z-10 flex gap-2">
        <button
          type="button"
          onClick={toggleLineMode}
          className={
            isLineMode
              ? "rounded-lg border border-blue-500 bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg"
              : "rounded-lg border border-slate-700 bg-slate-950/90 px-4 py-2 text-sm font-medium text-slate-200 shadow-lg hover:bg-slate-900"
          }
        >
          {isLineMode
            ? "Traçando linha"
            : "Traçar linha"}
        </button>

        {selectedLineLocationIds.length > 0 && (
          <button
            type="button"
            onClick={clearLine}
            className="rounded-lg border border-slate-700 bg-slate-950/90 px-4 py-2 text-sm text-slate-300 shadow-lg hover:bg-slate-900"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Instrução visual */}
      {isLineMode && (
        <div className="absolute left-4 top-16 z-10 rounded-lg border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-300 shadow-lg">
          {selectedLineLocationIds.length === 0 &&
            "Selecione o primeiro ponto."}

          {selectedLineLocationIds.length === 1 &&
            "Agora selecione o segundo ponto."}

          {selectedLineLocationIds.length === 2 &&
            "Linha criada entre os dois pontos."}
        </div>
      )}

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
    </div>
  );
}