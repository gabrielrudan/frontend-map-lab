"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    console.log("MapView: useEffect executado");

    if (!mapContainer.current) return;

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
            id: "osm",
            type: "raster",
            source: "osm",
          },
        ],
      },

      center: [-38.5267, -3.7319],
      zoom: 11,
    });

    console.log("MapView: instância do mapa criada");

    map.on("load", () => {
      console.log("MapView: mapa carregado");
    });

    map.on("error", (event) => {
      console.error("MapView: erro", event.error);
    });

    return () => {
      map.remove();
    };
  }, []);

  return <div ref={mapContainer} className="h-screen w-full" />;
}