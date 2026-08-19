"use client";

import { useState } from "react";

type CoordinateCardProps = {
  latitude: number;
  longitude: number;
};

export default function CoordinateCard({
  latitude,
  longitude,
}: CoordinateCardProps) {
  const [showCoordinates, setShowCoordinates] = useState(false);

  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h2 className="text-lg font-bold">
        Coordenada selecionada
      </h2>

      <button
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white"
        onClick={() => setShowCoordinates(!showCoordinates)}
      >
        {showCoordinates ? "Ocultar coordenadas" : "Mostrar coordenadas"}
      </button>

      {showCoordinates && (
        <div className="mt-4">
          <p>Latitude: {latitude}</p>
          <p>Longitude: {longitude}</p>
        </div>
      )}
    </div>
  );
}