"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Background,
  Controls,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { locationService } from "@/services/locationService";
import { relationService } from "@/services/relationService";

import type { Location } from "@/types/location";
import type { Relation } from "@/types/relation";

export default function GraphView() {
  const [locations, setLocations] =
    useState<Location[]>([]);

  const [relations, setRelations] =
    useState<Relation[]>([]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      locationService.getAll(),
      relationService.getAll(),
    ])
      .then(([loadedLocations, loadedRelations]) => {
        if (cancelled) return;

        setLocations(loadedLocations);
        setRelations(loadedRelations);
      })
      .catch((error) => {
        console.error(
          "Erro ao carregar dados do grafo:",
          error,
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const nodes = useMemo<Node[]>(() => {
    return locations.map((location, index) => ({
      id: location.id,

      data: {
        label: location.name,
      },

      position: {
        x: (index % 3) * 260,
        y: Math.floor(index / 3) * 160,
      },

      style: {
        background: "#0f172a",
        color: "#f8fafc",
        border: "1px solid #334155",
        borderRadius: "10px",
        padding: "12px 16px",
        minWidth: "150px",
      },
    }));
  }, [locations]);

  const edges = useMemo<Edge[]>(() => {
    return relations.map((relation) => ({
      id: relation.id,

      source: relation.sourceId,
      target: relation.targetId,

      label: relation.name,

      animated: true,

      style: {
        stroke: "#3b82f6",
        strokeWidth: 2,
      },

      labelStyle: {
        fill: "#cbd5e1",
        fontSize: 12,
      },
    }));
  }, [relations]);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{
          padding: 0.2,
        }}
        colorMode="dark"
      >
        <Background
          gap={20}
          size={1}
        />

        <Controls />
      </ReactFlow>
    </div>
  );
}