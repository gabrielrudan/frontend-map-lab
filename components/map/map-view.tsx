"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";

import ZoneDetailsModal from "@/components/zone/zone-details-modal";
import { pointsInPolygon } from "@/utils/poinstInPolygon";

import CreateLocationModal from "@/components/location/create-location-modal";
import LocationDetailsModal from "@/components/location/location-details-modal";
import CreateZoneModal from "@/components/zone/create-zone-modal";
import CreateRelationModal from "@/components/relation/create-relation-modal";

import { locationService } from "@/services/locationService";
import { zoneService } from "@/services/zoneService";
import { relationService } from "@/services/relationService";

import type * as GeoJSON from "geojson";

import type {
  CreateLocationDto,
  Location,
} from "@/types/location";
import type { Coordinate } from "@/types/coordinate";
import type {
  CreateZoneFormDto,
  Zone,
} from "@/types/zone";
import type {
  CreateRelationFormDto,
  Relation,
} from "@/types/relation";

import "./lib/mapWorker";

type Position = {
  lat: number;
  lng: number;
};

const emptyFeatureCollection = {
  type: "FeatureCollection" as const,
  features: [],
};

function coordinatesToRing(
  coordinates: Coordinate[],
): number[][] {
  if (coordinates.length === 0) {
    return [];
  }

  const ring = coordinates.map((coordinate) => [
    coordinate.lng,
    coordinate.lat,
  ]);

  const firstCoordinate = coordinates[0];

  ring.push([
    firstCoordinate.lng,
    firstCoordinate.lat,
  ]);

  return ring;
}

export default function MapView() {
  const mapContainer =
    useRef<HTMLDivElement | null>(null);

  const mapRef =
    useRef<maplibregl.Map | null>(null);

  const markersRef =
    useRef<maplibregl.Marker[]>([]);

  /*
   * =====================================================
   * LOCAIS
   * =====================================================
   */

  const [locations, setLocations] =
    useState<Location[]>([]);

  const [
    selectedPosition,
    setSelectedPosition,
  ] = useState<Position | null>(null);

  const [
    isCreateModalOpen,
    setIsCreateModalOpen,
  ] = useState(false);

  const [
    selectedLocation,
    setSelectedLocation,
  ] = useState<Location | null>(null);

  const [
    isDetailsModalOpen,
    setIsDetailsModalOpen,
  ] = useState(false);

  /*
   * =====================================================
   * LINHAS
   * =====================================================
   */

  const [isLineMode, setIsLineMode] =
    useState(false);

  const [
    selectedLineLocationIds,
    setSelectedLineLocationIds,
  ] = useState<string[]>([]);

  const [relations, setRelations] =
    useState<Relation[]>([]);

  const [
    pendingRelation,
    setPendingRelation,
  ] = useState<{
    sourceId: string;
    targetId: string;
  } | null>(null);

  const [
    isRelationModalOpen,
    setIsRelationModalOpen,
  ] = useState(false);

  /*
   * =====================================================
   * ZONAS
   * =====================================================
   */

  const [zones, setZones] =
    useState<Zone[]>([]);

  const [isZoneMode, setIsZoneMode] =
    useState(false);

  const [
    drawingCoordinates,
    setDrawingCoordinates,
  ] = useState<Coordinate[]>([]);

  const [
    isZoneModalOpen,
    setIsZoneModalOpen,
  ] = useState(false);

  const [
    selectedZone,
    setSelectedZone,
  ] = useState<Zone | null>(null);

  const [
    locationsInsideZone,
    setLocationsInsideZone,
  ] = useState<Location[]>([]);

  const [
    isZoneDetailsOpen,
    setIsZoneDetailsOpen,
  ] = useState(false);  

  /*
   * =====================================================
   * MAPA
   * =====================================================
   */

  const [isMapLoaded, setIsMapLoaded] =
    useState(false);

  /*
   * =====================================================
   * CARREGAMENTO DOS DADOS
   * =====================================================
   */

  async function loadLocations() {
    try {
      const data =
        await locationService.getAll();

      setLocations(data);
    } catch (error) {
      console.error(
        "Erro ao carregar locais:",
        error,
      );
    }
  }

  async function loadZones() {
    try {
      const data =
        await zoneService.getAll();

      setZones(data);
    } catch (error) {
      console.error(
        "Erro ao carregar zonas:",
        error,
      );
    }
  }

  async function loadRelations() {
    try {
      const data =
        await relationService.getAll();

      setRelations(data);
    } catch (error) {
      console.error(
        "Erro ao carregar relações:",
        error,
      );
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
        console.error(
          "Erro ao carregar locais:",
          error,
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Carrega zonas persistidas
  useEffect(() => {
    let cancelled = false;

    zoneService
      .getAll()
      .then((data) => {
        if (!cancelled) {
          setZones(data);
        }
      })
      .catch((error) => {
        console.error(
          "Erro ao carregar zonas:",
          error,
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Carrega relações persistidas
  useEffect(() => {
    let cancelled = false;

    relationService
      .getAll()
      .then((data) => {
        if (!cancelled) {
          setRelations(data);
        }
      })
      .catch((error) => {
        console.error(
          "Erro ao carregar relações:",
          error,
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * =====================================================
   * CRIAÇÃO DO MAPA
   * =====================================================
   */

  useEffect(() => {
    if (
      !mapContainer.current ||
      mapRef.current
    ) {
      return;
    }

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
            maxzoom: 18,
            attribution:
              "© OpenStreetMap contributors",
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
      maxZoom: 18,
    });

    mapRef.current = map;

    map.addControl(
      new maplibregl.NavigationControl(),
      "bottom-left",
    );

    map.on("load", () => {
      /*
       * -----------------------------------------------
       * Polyline temporária
       * -----------------------------------------------
       */

      map.addSource("selected-line", {
        type: "geojson",
        data: emptyFeatureCollection,
      });

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

      /*
       * -----------------------------------------------
       * Relações persistidas
       * -----------------------------------------------
       */

      map.addSource("relations", {
        type: "geojson",
        data: emptyFeatureCollection,
      });

      map.addLayer({
        id: "relations-casing",
        type: "line",
        source: "relations",

        layout: {
          "line-cap": "round",
          "line-join": "round",
        },

        paint: {
          "line-color": "#ffffff",
          "line-width": 7,
          "line-opacity": 0.65,
        },
      });

      map.addLayer({
        id: "relations-line",
        type: "line",
        source: "relations",

        layout: {
          "line-cap": "round",
          "line-join": "round",
        },

        paint: {
          "line-color": "#22c55e",
          "line-width": 4,
          "line-dasharray": [2, 1],
        },
      });

      /*
       * -----------------------------------------------
       * Zonas persistidas
       * -----------------------------------------------
       */

      map.addSource("zones", {
        type: "geojson",
        data: emptyFeatureCollection,
      });

      map.addLayer({
        id: "zones-fill",
        type: "fill",
        source: "zones",

        paint: {
          "fill-color": [
            "coalesce",
            ["get", "color"],
            "#3b82f6",
          ],

          "fill-opacity": 0.2,
        },
      });

      map.addLayer({
        id: "zones-line",
        type: "line",
        source: "zones",

        layout: {
          "line-cap": "round",
          "line-join": "round",
        },

        paint: {
          "line-color": [
            "coalesce",
            ["get", "color"],
            "#3b82f6",
          ],

          "line-width": 3,
          "line-opacity": 0.9,
        },
      });

      map.on("mouseenter", "zones-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "zones-fill", () => {
        map.getCanvas().style.cursor = "";
      });      

      /*
       * -----------------------------------------------
       * Zona que está sendo desenhada
       * -----------------------------------------------
       */

      map.addSource("drawing-zone", {
        type: "geojson",
        data: emptyFeatureCollection,
      });

      // Preenchimento temporário
      map.addLayer({
        id: "drawing-zone-fill",
        type: "fill",
        source: "drawing-zone",

        filter: [
          "==",
          ["geometry-type"],
          "Polygon",
        ],

        paint: {
          "fill-color": "#3b82f6",
          "fill-opacity": 0.15,
        },
      });

      // Linhas temporárias
      map.addLayer({
        id: "drawing-zone-line",
        type: "line",
        source: "drawing-zone",

        filter: [
          "==",
          ["geometry-type"],
          "LineString",
        ],

        layout: {
          "line-cap": "round",
          "line-join": "round",
        },

        paint: {
          "line-color": "#60a5fa",
          "line-width": 3,
          "line-dasharray": [2, 2],
        },
      });

      // Vértices temporários
      map.addLayer({
        id: "drawing-zone-vertices",
        type: "circle",
        source: "drawing-zone",

        filter: [
          "==",
          ["geometry-type"],
          "Point",
        ],

        paint: {
          "circle-color": "#3b82f6",
          "circle-radius": 6,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });

      setIsMapLoaded(true);
    });

    map.on("error", (event) => {
      console.error(
        "Erro no MapLibre:",
        event.error,
      );
    });

    return () => {
      markersRef.current.forEach(
        (marker) => marker.remove(),
      );

      markersRef.current = [];

      map.remove();
      mapRef.current = null;
    };
  }, []);

  /*
   * =====================================================
   * CLIQUE NO MAPA
   * =====================================================
   */

  useEffect(() => {
    const map = mapRef.current;

    if (!map) return;

    function handleMapClick(
      event: maplibregl.MapMouseEvent,
    ) {
      if (!map) return;

      const features = map.queryRenderedFeatures(
        event.point,
        {
          layers: ["zones-fill"],
        },
      );

      const clickedZoneFeature =
        features[0];

      const { lat, lng } = event.lngLat;

      /*
       * Modo Zona
       */

      if (
        !isZoneMode &&
        !isLineMode &&
        clickedZoneFeature
      ) {
        const zoneId =
          clickedZoneFeature.properties?.id;

        const zone = zones.find(
          (candidate) =>
            candidate.id === zoneId,
        );

        if (zone) {
          const pointsInside =
            locations.filter(
              (location) =>
                pointsInPolygon(
                  {
                    lat: location.lat,
                    lng: location.lng,
                  },
                  zone.coordinates,
                ),
            );

          setSelectedZone(zone);

          setLocationsInsideZone(
            pointsInside,
          );

          setIsZoneDetailsOpen(true);

          return;
        }
      }      

      if (isZoneMode) {
        setDrawingCoordinates(
          (previousCoordinates) => [
            ...previousCoordinates,
            {
              lat,
              lng,
            },
          ],
        );

        return;
      }

      /*
       * Modo Linha
       */
      if (isLineMode) {
        return;
      }

      /*
       * Modo padrão:
       * cadastrar local
       */
      setSelectedPosition({
        lat,
        lng,
      });

      setIsCreateModalOpen(true);
    }

    map.on(
      "click",
      handleMapClick,
    );

    return () => {
      map.off(
        "click",
        handleMapClick,
      );
    };
  }, [
    isLineMode,
    isZoneMode,
    zones,
    locations,
  ]);

  /*
   * =====================================================
   * MARKERS
   * =====================================================
   */

  useEffect(() => {
    const map = mapRef.current;

    if (!map) return;

    markersRef.current.forEach(
      (marker) => marker.remove(),
    );

    markersRef.current =
      locations.map((location) => {
        const markerElement =
          document.createElement("button");

        markerElement.type =
          "button";

        const isSelected =
          selectedLineLocationIds.includes(
            location.id,
          );

        markerElement.className =
          isSelected
            ? "map-pin map-pin-selected"
            : "map-pin";

        markerElement.title =
          isLineMode
            ? `Selecionar ${location.name}`
            : location.name;

        markerElement.setAttribute(
          "aria-label",
          isLineMode
            ? `Selecionar ${location.name} para traçar linha`
            : `Abrir detalhes de ${location.name}`,
        );

        markerElement.addEventListener(
          "click",
          (event) => {
            event.stopPropagation();

            /*
             * Durante desenho de zona,
             * clique em marker não faz nada.
             */
            if (isZoneMode) {
              return;
            }

            /*
             * Modo de relação
             */
            if (isLineMode) {
              if (
                selectedLineLocationIds.includes(
                  location.id,
                )
              ) {
                return;
              }

              if (
                selectedLineLocationIds.length === 0
              ) {
                setSelectedLineLocationIds([
                  location.id,
                ]);

                return;
              }

              const sourceId =
                selectedLineLocationIds[0];

              const targetId =
                location.id;

              const relationAlreadyExists =
                relations.some(
                  (relation) =>
                    (relation.sourceId === sourceId &&
                      relation.targetId === targetId) ||
                    (relation.sourceId === targetId &&
                      relation.targetId === sourceId),
                );

              if (relationAlreadyExists) {
                console.warn(
                  "Já existe uma relação entre esses locais.",
                );

                setSelectedLineLocationIds([]);

                return;
              }

              setSelectedLineLocationIds([
                sourceId,
                targetId,
              ]);

              setPendingRelation({
                sourceId,
                targetId,
              });

              setIsRelationModalOpen(true);

              return;
            }

            /*
             * Modo normal:
             * detalhes do local
             */
            setSelectedLocation(
              location,
            );

            setIsDetailsModalOpen(
              true,
            );
          },
        );

        return new maplibregl.Marker({
          element: markerElement,
          anchor: "bottom",
        })
          .setLngLat([
            location.lng,
            location.lat,
          ])
          .addTo(map);
      });
  }, [
    locations,
    isLineMode,
    isZoneMode,
    selectedLineLocationIds,
    relations,
  ]);

  /*
   * =====================================================
   * POLYLINE
   * =====================================================
   */

  useEffect(() => {
    if (!isMapLoaded) return;

    const map = mapRef.current;

    if (!map) return;

    const source =
      map.getSource(
        "selected-line",
      ) as
        | maplibregl.GeoJSONSource
        | undefined;

    if (!source) return;

    if (
      selectedLineLocationIds.length !==
      2
    ) {
      source.setData(
        emptyFeatureCollection,
      );

      return;
    }

    const firstLocation =
      locations.find(
        (location) =>
          location.id ===
          selectedLineLocationIds[0],
      );

    const secondLocation =
      locations.find(
        (location) =>
          location.id ===
          selectedLineLocationIds[1],
      );

    if (
      !firstLocation ||
      !secondLocation
    ) {
      return;
    }

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

  /*
   * =====================================================
   * RELAÇÕES PERSISTIDAS
   * =====================================================
   */

  useEffect(() => {
    if (!isMapLoaded) return;

    const map = mapRef.current;

    if (!map) return;

    const source =
      map.getSource(
        "relations",
      ) as
        | maplibregl.GeoJSONSource
        | undefined;

    if (!source) return;

    const features = relations.flatMap(
      (relation) => {
        const sourceLocation =
          locations.find(
            (location) =>
              location.id ===
              relation.sourceId,
          );

        const targetLocation =
          locations.find(
            (location) =>
              location.id ===
              relation.targetId,
          );

        if (
          !sourceLocation ||
          !targetLocation
        ) {
          return [];
        }

        return [
          {
            type: "Feature" as const,

            properties: {
              id: relation.id,
              name: relation.name,
              sourceId: relation.sourceId,
              targetId: relation.targetId,
              sourceName:
                sourceLocation.name,
              targetName:
                targetLocation.name,
            },

            geometry: {
              type: "LineString" as const,

              coordinates: [
                [
                  sourceLocation.lng,
                  sourceLocation.lat,
                ],
                [
                  targetLocation.lng,
                  targetLocation.lat,
                ],
              ],
            },
          },
        ];
      },
    );

    source.setData({
      type: "FeatureCollection",
      features,
    });
  }, [
    isMapLoaded,
    relations,
    locations,
  ]);

  /*
   * =====================================================
   * DESENHO TEMPORÁRIO DA ZONA
   * =====================================================
   */

  useEffect(() => {
    if (!isMapLoaded) return;

    const map = mapRef.current;

    if (!map) return;

    const source =
      map.getSource(
        "drawing-zone",
      ) as
        | maplibregl.GeoJSONSource
        | undefined;

    if (!source) return;

    if (
      !isZoneMode ||
      drawingCoordinates.length === 0
    ) {
      source.setData(
        emptyFeatureCollection,
      );

      return;
    }

    const features: GeoJSON.Feature[] =
      drawingCoordinates.map(
        (coordinate) => ({
          type: "Feature",

          properties: {},

          geometry: {
            type: "Point",

            coordinates: [
              coordinate.lng,
              coordinate.lat,
            ],
          },
        }),
      );

    /*
     * A partir de 2 pontos,
     * desenha uma linha.
     */
    if (
      drawingCoordinates.length >= 2
    ) {
      features.push({
        type: "Feature",

        properties: {},

        geometry: {
          type: "LineString",

          coordinates:
            drawingCoordinates.map(
              (coordinate) => [
                coordinate.lng,
                coordinate.lat,
              ],
            ),
        },
      });
    }

    /*
     * A partir de 3 pontos,
     * já conseguimos visualizar
     * o polígono.
     */
    if (
      drawingCoordinates.length >= 3
    ) {
      features.push({
        type: "Feature",

        properties: {},

        geometry: {
          type: "Polygon",

          coordinates: [
            coordinatesToRing(
              drawingCoordinates,
            ),
          ],
        },
      });
    }

    source.setData({
      type: "FeatureCollection",
      features,
    });
  }, [
    isMapLoaded,
    isZoneMode,
    drawingCoordinates,
  ]);

  /*
   * =====================================================
   * ZONAS PERSISTIDAS
   * =====================================================
   */

  useEffect(() => {
    if (!isMapLoaded) return;

    const map = mapRef.current;

    if (!map) return;

    const source =
      map.getSource(
        "zones",
      ) as
        | maplibregl.GeoJSONSource
        | undefined;

    if (!source) return;

    const features =
      zones
        .filter(
          (zone) =>
            zone.coordinates.length >=
            3,
        )
        .map((zone) => ({
          type: "Feature" as const,

          properties: {
            id: zone.id,
            name: zone.name,
            color: zone.color,
          },

          geometry: {
            type: "Polygon" as const,

            coordinates: [
              coordinatesToRing(
                zone.coordinates,
              ),
            ],
          },
        }));

    source.setData({
      type: "FeatureCollection",
      features,
    });
  }, [
    isMapLoaded,
    zones,
  ]);

  /*
   * =====================================================
   * CADASTRO DE LOCAL
   * =====================================================
   */

  async function handleLocationCreated(
    location: CreateLocationDto,
  ) {
    try {
      await locationService.create(
        location,
      );

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

  /*
   * =====================================================
   * CADASTRO DE ZONA
   * =====================================================
   */

  async function handleZoneCreated(
    data: CreateZoneFormDto,
  ) {
    try {
      if (
        drawingCoordinates.length <
        3
      ) {
        return;
      }

      await zoneService.create({
        name: data.name,
        color: data.color,
        coordinates:
          drawingCoordinates,
      });

      await loadZones();

      setDrawingCoordinates([]);

      setIsZoneModalOpen(false);

      setIsZoneMode(false);
    } catch (error) {
      console.error(
        "Erro ao cadastrar zona:",
        error,
      );
    }
  }

  /*
   * =====================================================
   * CADASTRO DE RELAÇÃO
   * =====================================================
   */

  async function handleRelationCreated(
    data: CreateRelationFormDto,
  ) {
    if (!pendingRelation) return;

    try {
      await relationService.create({
        name: data.name,
        sourceId:
          pendingRelation.sourceId,
        targetId:
          pendingRelation.targetId,
      });

      await loadRelations();

      setPendingRelation(null);
      setSelectedLineLocationIds([]);
      setIsRelationModalOpen(false);
      setIsLineMode(false);
    } catch (error) {
      console.error(
        "Erro ao cadastrar relação:",
        error,
      );
    }
  }

  /*
   * =====================================================
   * CONTROLES DA LINHA
   * =====================================================
   */

  function toggleLineMode() {
    setIsLineMode(
      (previous) => !previous,
    );

    setIsZoneMode(false);

    setDrawingCoordinates([]);

    setSelectedLineLocationIds([]);
    setPendingRelation(null);
    setIsRelationModalOpen(false);
  }

  function clearLine() {
    setSelectedLineLocationIds([]);
  }

  /*
   * =====================================================
   * CONTROLES DA ZONA
   * =====================================================
   */

  function toggleZoneMode() {
    setIsZoneMode(
      (previous) => !previous,
    );

    setIsLineMode(false);

    setSelectedLineLocationIds([]);

    setDrawingCoordinates([]);
  }

  function cancelZoneDrawing() {
    setDrawingCoordinates([]);
    setIsZoneMode(false);
  }

  function finishZoneDrawing() {
    if (
      drawingCoordinates.length < 3
    ) {
      return;
    }

    setIsZoneModalOpen(true);
  }

  /*
   * =====================================================
   * RENDER
   * =====================================================
   */

  return (
    <div className="relative">
      <div
        ref={mapContainer}
        className="h-[calc(100vh-3.5rem)] w-full"
      />

      {/* Toolbar */}
      <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
        {/* Linha */}
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
            ? "Relacionando locais"
            : "Relacionar locais"}
        </button>

        {/* Zona */}
        <button
          type="button"
          onClick={toggleZoneMode}
          className={
            isZoneMode
              ? "rounded-lg border border-blue-500 bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg"
              : "rounded-lg border border-slate-700 bg-slate-950/90 px-4 py-2 text-sm font-medium text-slate-200 shadow-lg hover:bg-slate-900"
          }
        >
          {isZoneMode
            ? "Desenhando zona"
            : "Desenhar zona"}
        </button>

        {/* Limpar linha */}
        {isLineMode &&
          selectedLineLocationIds.length >
            0 && (
            <button
              type="button"
              onClick={clearLine}
              className="rounded-lg border border-slate-700 bg-slate-950/90 px-4 py-2 text-sm text-slate-300 shadow-lg hover:bg-slate-900"
            >
              Limpar linha
            </button>
          )}

        {/* Finalizar zona */}
        {isZoneMode &&
          drawingCoordinates.length >=
            3 && (
            <button
              type="button"
              onClick={
                finishZoneDrawing
              }
              className="rounded-lg border border-emerald-500 bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-emerald-500"
            >
              Finalizar zona
            </button>
          )}

        {/* Cancelar zona */}
        {isZoneMode &&
          drawingCoordinates.length >
            0 && (
            <button
              type="button"
              onClick={
                cancelZoneDrawing
              }
              className="rounded-lg border border-slate-700 bg-slate-950/90 px-4 py-2 text-sm text-slate-300 shadow-lg hover:bg-slate-900"
            >
              Cancelar
            </button>
          )}
      </div>

      {/* Mensagem: linha */}
      {isLineMode && (
        <div className="absolute left-4 top-16 z-10 rounded-lg border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-300 shadow-lg">
          {selectedLineLocationIds.length ===
            0 &&
            "Selecione o local de origem."}

          {selectedLineLocationIds.length ===
            1 &&
            "Agora selecione o local de destino."}

          {selectedLineLocationIds.length ===
            2 &&
            "Defina o nome da relação no formulário."}
        </div>
      )}

      {/* Mensagem: zona */}
      {isZoneMode && (
        <div className="absolute left-4 top-16 z-10 rounded-lg border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-300 shadow-lg">
          {drawingCoordinates.length ===
            0 &&
            "Clique no mapa para adicionar o primeiro vértice."}

          {drawingCoordinates.length ===
            1 &&
            "Adicione pelo menos mais dois vértices."}

          {drawingCoordinates.length ===
            2 &&
            "Adicione mais um vértice para formar a zona."}

          {drawingCoordinates.length >=
            3 &&
            `${drawingCoordinates.length} vértices selecionados. Você já pode finalizar a zona.`}
        </div>
      )}

      {/* Modal de criação de local */}
      <CreateLocationModal
        open={isCreateModalOpen}
        position={selectedPosition}
        onCancel={() => {
          setSelectedPosition(null);

          setIsCreateModalOpen(
            false,
          );
        }}
        onLocationCreated={
          handleLocationCreated
        }
      />

      {/* Modal de detalhes */}
      <LocationDetailsModal
        open={isDetailsModalOpen}
        location={selectedLocation}
        onCancel={() => {
          setSelectedLocation(null);

          setIsDetailsModalOpen(
            false,
          );
        }}
      />

      {/* Modal de criação de relação */}
      <CreateRelationModal
        open={isRelationModalOpen}
        sourceName={
          pendingRelation
          ? locations.find(
              (location) =>
                location.id ===
                pendingRelation.sourceId,
            )?.name
          : undefined
        }
        targetName={
          pendingRelation
          ? locations.find(
              (location) =>
                location.id ===
                pendingRelation.targetId,
            )?.name
          : undefined
        }
        onCancel={() => {
          setPendingRelation(null);
          setSelectedLineLocationIds([]);
          setIsRelationModalOpen(false);
        }}
        onRelationCreated={
          handleRelationCreated
        }
      />

      {/* Modal de criação de zona */}
      <CreateZoneModal
        open={isZoneModalOpen}
        onCancel={() => {
          setIsZoneModalOpen(false);
        }}
        onZoneCreated={
          handleZoneCreated
        }
      />
      <ZoneDetailsModal
        open={isZoneDetailsOpen}
        zone={selectedZone}
        locationsInsideZone={
          locationsInsideZone
        }
        onCancel={() => {
          setSelectedZone(null);

          setLocationsInsideZone([]);

          setIsZoneDetailsOpen(false);
        }}
      />
    </div>    
  );
}